function App() {
  const [district, setDistrict] = React.useState('1');
  const [contracts, setContracts] = React.useState([]);

  const loadContracts = () => {
    fetch(`/contracts?district=${district}`)
      .then(res => res.json())
      .then(data => setContracts([data.message]));
  };

  const submitContract = (e) => {
    e.preventDefault();
    const text = e.target.elements.text.value;
    fetch(`/contracts?district=${district}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(loadContracts);
  };

  return (
    <div>
      <h1>Minsk Housing Dashboard</h1>
      <label>
        District:
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i} value={i+1}>{`District ${i+1}`}</option>
          ))}
        </select>
      </label>
      <button onClick={loadContracts}>Load Contracts</button>
      <form onSubmit={submitContract}>
        <input name="text" placeholder="Contract text" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {contracts.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
