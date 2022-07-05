import './App.css'

const App = () => {

  const getLocations = ({}) => {
    const params = {
      zipCode: `30542`,
      radiusInMiles: 50,
      // 1-100
      limit: 50,
      // 1-200
      chain: `kroger`,
  }
    const data = fetch("http://localhost:4040/locations", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(e => console.log(e))
  }

  const getProducts = () => {
    const params = {
      brand: "",
      term: "milk",
      locationId: "01100494",
      productId: "",
      fulfillment: "",
      start: "",
      limit: 50,
      // 1-50
  }
    const data = fetch("http://localhost:4040/products", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(e => console.log(e))
  }

  return (
    <div className="App">
      <header>hello</header>
      <button onClick={getLocations}>Locations</button>
      <button onClick={getProducts}>Products</button>
    </div>
  );
}

export default App
