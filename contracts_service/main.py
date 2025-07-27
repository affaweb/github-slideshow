from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, Date, create_engine, func
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from typing import List

app = FastAPI(title="Минск ЖКХ Договоры")

Base = declarative_base()

# модель договора
class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

class ContractIn(BaseModel):
    title: str
    description: str | None = None
    cost: float | None = None
    start_date: str | None = None  # ISO формат YYYY-MM-DD
    end_date: str | None = None

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DISTRICTS = [f"district_{i}" for i in range(1, 10)]
SUPER_DB = "supervisor"

# утилита для получения движка БД

def get_engine(name: str):
    os.makedirs(DATA_DIR, exist_ok=True)
    db_path = os.path.join(DATA_DIR, f"{name}.db")
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    return engine

# контекстное создание сессии

def get_session(name: str):
    engine = get_engine(name)
    Session = sessionmaker(bind=engine)
    return Session()

@app.get("/districts", response_model=List[str])
def list_districts():
    return DISTRICTS

@app.post("/districts/{district}/contracts")
def add_contract(district: str, contract: ContractIn):
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="Нет такого района")
    db = get_session(district)
    db_contract = Contract(**contract.model_dump())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    db.close()
    return {"id": db_contract.id}

@app.get("/districts/{district}/contracts", response_model=List[ContractIn])
def list_contracts(district: str):
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="Нет такого района")
    db = get_session(district)
    contracts = db.query(Contract).all()
    result = [ContractIn(**{
        "title": c.title,
        "description": c.description,
        "cost": c.cost,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None
    }) for c in contracts]
    db.close()
    return result

@app.get("/districts/{district}/analytics")
def district_analytics(district: str):
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="Нет такого района")
    db = get_session(district)
    count = db.query(func.count(Contract.id)).scalar() or 0
    total_cost = db.query(func.sum(Contract.cost)).scalar() or 0
    db.close()
    return {"contracts": count, "total_cost": total_cost}

@app.get("/supervisor/analytics")
def supervisor_analytics():
    totals = {"contracts": 0, "total_cost": 0}
    for d in DISTRICTS:
        db = get_session(d)
        totals["contracts"] += db.query(func.count(Contract.id)).scalar() or 0
        totals["total_cost"] += db.query(func.sum(Contract.cost)).scalar() or 0
        db.close()
    return totals

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
