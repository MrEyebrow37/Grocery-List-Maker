import './App.css'
import Product from './components/kroger-product'
import Location from './components/kroger-location'
import Recipe from './components/recipe'
import {useState} from 'react'
import {BrowserRouter as Router,Routes,Route,Link} from "react-router-dom"
// Import functions
import login from './functions/login'
import register from './functions/register'
import {getRecipes} from './functions/recipes'

const App = () => {

  let saveData = () =>{
    localStorage.setItem('Object 1', "test object");
  }
  let getData = () =>{
    var data = localStorage.getItem("Object 1")
    alert(data)
  }

  // State ///////////////////////////////////////////////////////////////////////////
  const [port,setPort] = useState(`http://localhost:4040`)
  const [userInfo, setUserInfo] = useState({username: "guest"})
  const [products, setProducts] = useState([])
  const [recipes,setRecipes] = useState([""])
  const [locations, setLocations] = useState([])
  const [searchBox, setSearchBox] = useState({
    product: {
      brand: "",
      term: "",
      locationId: "",
      productId: "",
      fulfillment: "",
      start: "",
      limit: 50,
      // 1-50
    },
    location: {
      zipCode: "",
      radiusInMiles: 50,
      // 1-100
      limit: 50,
      // 1-200
      chain: `kroger`,
    }
  })
  
  if (process.env.NODE_ENV === `production`) {
    setPort(`https://kroger-grocery-list-maker.herokuapp.com`)
    // setPort(`http://localhost:4040`)
  }

  const state = {
    port: port,
    setPort: setPort,
    userInfo: userInfo,
    setUserInfo: setUserInfo,
    products: products,
    setProducts: setProducts,
    recipes: recipes,
    setRecipes: setRecipes,
    locations: locations,
    setLocations: setLocations,
    searchBox: searchBox,
    setSearchBox: setSearchBox,
  }

  console.log(state.products)

  // Functions ///////////////////////////////////////////////////////////////////////////

  const getLocations = (params) => {
    if (params.zipCode.length === 5) {
      fetch(`${port}/api/locations`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      .then(res => res.json())
      .then(res => {
        setLocations(res.data)
      })
      .catch(e => console.log(e))
    } else {
      console.log("Need 5 digit zip code")
    }
  }

  const getProducts = (params) => {
    if (!params.locationId) {
      alert("Please choose a Kroger Location to search for products.")
    } else if (params.term.length >= 3) {
      fetch(`${port}/api/products`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params),
      })
      .then(res => res.json())
      .then(res => {
        setProducts(res.data)
      })
      .catch(e => console.log(e))
    } else {
      alert("Your search term must be greater than 2 characters.")
    }
  }

  const postRecipes = () => {
    const operations = {
        insertOne: {
          document: {
            username: userInfo.username,
          },
        },
      }
    
    fetch(`${port}/api/recipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operations),
    })
    .then(res => res.json())
    .then(res => {
      console.log("yes")
      getRecipes({username: userInfo.username},state,functions)
    })
    .catch(e => console.log(e))
  }

  const handleProductSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      prevState.product.term = e.target.value
      return prevState
    })
  }

  const handleZipCodeSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      prevState.location.zipCode = e.target.value
      return prevState
    })
  }

  const setUserLocation = (location) => {
    setUserInfo(prevState => {
      const newState = {...prevState}
      newState.krogerLocation = location.locationId
      return prevState
    })
    setSearchBox(prevState => {
      prevState.product.krogerLocation = location.krogerLocation
      return prevState
    })

    const params = {
      username: userInfo.username,
    }
    const operations = {
      updateOne: {
        filter: params,
        update: {
          $set: {
            krogerLocation: location.locationId
          }
        }
      }
    }

    const data = {
      operations: operations,
    }

    fetch(`${port}/api/setZipCode`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
    })
    .catch(e => console.log(e))
  }

  const addToRecipe = ({recipeTitle,product,quantityInRecipe}) => {
    const operations = {
      updateOne: {
        filter: {
          username: userInfo.username,
          title: recipeTitle
        },
        update: {
          $set: {
            [`products.${product.productId}`]: {...product, quantityInRecipe: quantityInRecipe},
          },
        },
        upsert: true
      },
    }
  
    fetch(`${port}/api/recipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operations),
    })
    .then(res => res.json())
    .then(res => getRecipes({username: userInfo.username},state,functions))
    .catch(e => console.log(e))
  }

  const functions = {
    getLocations: getLocations,
    getProducts: getProducts,
    getRecipes: getRecipes,
    postRecipes: postRecipes,
    handleProductSearchBoxChange: handleProductSearchBoxChange,
    handleZipCodeSearchBoxChange: handleZipCodeSearchBoxChange,
    setUserLocation: setUserLocation,
    addToRecipe: addToRecipe,
  }

  return (
    <div className="App">
      <Router>
        <header>
          <details className={`locations`}>
            <summary>Search Locations</summary>
            <div>
              <button onClick={() => {getLocations(searchBox.location)}}>Get Locations</button>
              <input placeholder={`Zip Code`} name={`zipCodeSearchBox`} onChange={handleZipCodeSearchBoxChange} onKeyUp={(e) => {
                if (e.key === "Enter") {
                  getLocations(searchBox.location)
                }
              }}></input>
              {locations.map(location => <Location location={{...location}} state={{...state}} functions={{...functions}} key={location.locationId}></Location>)}
            </div>
          </details>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
          <button onClick={() => {getRecipes({username: userInfo.username},state,functions)}}>Get Recipes</button>
          <button onClick={saveData}>Save!</button>
          <button onClick={getData}>Display Info!</button>
        </header>
        
        <Routes>

          <Route path="/register" element={
            <main>
              <input className={`username`} type={`username`} placeholder={`username`}></input>
              <input className={`password`} type={`password`} placeholder={`password`}></input>
              <button onClick={() => {register({password: document.querySelector(`.password`).value, username: document.querySelector(`.username`).value.toLowerCase()},state,functions)
              }}>Register</button>
            </main>
          }></Route>

          <Route path="/login" element={
            <main>
              <input className={`username`} type={`username`} placeholder={`username`}></input>
              <input className={`password`} type={`password`} placeholder={`password`}></input>
              <button onClick={() => {login({password: document.querySelector(`.password`).value, username: document.querySelector(`.username`).value.toLowerCase()},state,functions)}}>Login</button>
            </main>
          }></Route>

          <Route path="/recipes" element={
            <main>
              {recipes.map((recipe,index) => <Recipe state={state} functions={functions} recipe={recipe} key={index}></Recipe>)}
            </main>
          }></Route>

          <Route path="/" element={
            <main>
              <button onClick={() => {getProducts(searchBox.product)}}>Get Products</button>
              <button onClick={() => {getRecipes({username: userInfo.username},state,functions)}}>Get Recipes</button>
              <button onClick={() => {postRecipes()}}>Post Recipes</button>
              <input placeholder={`product`} name={`productSearchBox`} onChange={handleProductSearchBoxChange} onKeyUp={(e) => {
                if (e.key === "Enter") {
                  getProducts(searchBox.product)
                }
              }}></input>
      
              {products.filter(product => product.items[0].price && product.sizes[0]).map((product,index) => <Product product={{...product}} state={{...state}} functions={{...functions}} key={index}></Product>)}
            </main>
          }></Route>

        </Routes>
      </Router>
      
      <footer>Footer</footer>
    </div>
  )
}

export default App
