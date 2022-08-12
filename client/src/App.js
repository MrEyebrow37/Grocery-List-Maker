import './App.css'
import Product from './components/kroger-product'
import Location from './components/kroger-location'
import Recipe from './components/recipe'
import RecipeProduct from './components/kroger-product-recipes'
import {useState} from 'react'
import {BrowserRouter as Router,Routes,Route,Link} from "react-router-dom"
// Import functions
import login from './functions/login'
import register from './functions/register'
import {getRecipes} from './functions/recipes'

const App = () => {

  let port = `http://localhost:4040`
  // if (process.env.NODE_ENV === `production`) {
  //   port = `https://kroger-grocery-list-maker.herokuapp.com`
  //   // setPort(`http://localhost:4040`)
  // }

  // State ///////////////////////////////////////////////////////////////////////////
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

  const state = {
    port: port,
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

  const handleProductSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      const newState = {...prevState}
      newState.product.term = e.target.value
      return newState
    })
  }

  const handleZipCodeSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      const newState = {...prevState}
      prevState.location.zipCode = e.target.value
      return prevState
    })
  }

  const setUserLocation = (location) => {
    setUserInfo(prevState => {
      const newState = {...prevState}
      newState.krogerLocation = location.locationId
      return newState
    })
    setSearchBox(prevState => {
      const newState = {...prevState}
      newState.product.krogerLocation = location.krogerLocation
      return newState
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

  const addToRecipe = async({recipeTitle,product,quantityInRecipe,sizeInRecipe}) => {
    let newRecipeTitle
    if (recipeTitle === `Make new recipe`) {
      newRecipeTitle = await prompt(`Please enter the title of your recipe.`)
    } else {
      newRecipeTitle = recipeTitle
    }

    // What info do I need to save in my database?
    //  {
      // productId: {
        // quangityInRecipe
        // sizeInRecipe
        // sizes
      // }
    // }

    const operations = {
      updateOne: {
        filter: {
          username: userInfo.username,
          title: newRecipeTitle,
        },
        update: {
          $set: {
            [`products.${product.productId}`]: {quantityInRecipe: quantityInRecipe, sizeInRecipe: sizeInRecipe,sizes: product.sizes},
            servings: 6,
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
    .then(res => getRecipes({username: userInfo.username},searchBox.product,state,functions))
    .catch(e => console.log(e))
  }

  const functions = {
    getLocations: getLocations,
    getProducts: getProducts,
    getRecipes: getRecipes,
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
          <button onClick={() => {getRecipes({username: userInfo.username},searchBox.product,state,functions)}}>Get Recipes</button>
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
              <button onClick={() => {getRecipes({username: userInfo.username},searchBox.product,state,functions)}}>Get Recipes</button>
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
