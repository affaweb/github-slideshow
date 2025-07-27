module.exports = {
  districts: Array.from({ length: 9 }, (_, i) => ({
    name: `District ${i + 1}`,
    db: `db/district${i + 1}.json`
  })),
  cityDb: 'db/city.json'
};
