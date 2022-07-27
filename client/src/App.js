import './App.css'
import Product from './components/kroger-product'
import Location from './components/kroger-location'
import Recipe from './components/recipe'
import {useState} from 'react'
import {BrowserRouter as Router,Routes,Route,Link} from "react-router-dom";

const App = () => {

  let port = `http://localhost:4040`

  if (process.env.NODE_ENV === `production`) {
    port = `https://kroger-grocery-list-maker.herokuapp.com/`
  }

  // State ///////////////////////////////////////////////////////////////////////////
  const [userInfo, setUserInfo] = useState({username: "guest"})
  const [products, setProducts] = useState([])
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
    products: products,
    setProducts: setProducts,
    locations: locations,
    setLocations: setLocations,
    searchBox: searchBox,
    setSearchBox: setSearchBox,
    userInfo: userInfo,
    setUserInfo: setUserInfo,
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
    if (params.term.length >= 3 && params.locationId) {
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
      console.log("search term need to be greater >= 3")
    }
  }

  const getRecipes = () => {
    const filter = {
      username: userInfo.username
    }
    fetch(`${port}/api/getRecipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filter),
    })
    .then(res => res.json())
    .then(res => {
      setUserInfo(prevState => {
        prevState.recipes = res
        return prevState
      })
    })
    .catch(e => console.log(e))
  }
  console.log(userInfo)

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
    .then(res => console.log(res))
    .catch(e => console.log(e))
  }

  const handleProductSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      prevState.product.term = e.target.value
      return {...prevState}
    })
  }

  const handleZipCodeSearchBoxChange = (e) => {
    setSearchBox(prevState => {
      prevState.location.zipCode = e.target.value
      return {...prevState}
    })
  }

  const setUserLocation = (location) => {
    setUserInfo(prevState => {
      prevState.krogerLocation = location.locationId
      return prevState
    })
    setSearchBox(prevState => {
      prevState.product.locationId = location.locationId
      return prevState
    })

    const params = {
      username: userInfo.username,
    }
    console.log(userInfo.username)
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

  const login = async() => {
    const params = {
      password: document.querySelector(`.password`).value,
      username: document.querySelector(`.username`).value.toLowerCase(),
    }

    const operations = {
      insertOne: {
        document: params
      }
    }

    const filter = {
      username: params.username
    }

    const data = {
      operations: operations,
      filter: filter,
      params: params,
    }

    await fetch(`${port}/api/login`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        if (res.response === `Success!`) {
          setUserInfo({username: params.username})
        } else {
          console.log(res)
        }
        document.querySelector(`.password`).value = ''
        document.querySelector(`.username`).value = ''
      })
      .catch(e => console.log(e))

      getRecipes()
  }

  const register = async() => {
    const params = {
      password: document.querySelector(`.password`).value,
      username: document.querySelector(`.username`).value.toLowerCase(),
    }

    const operations = {
      insertOne: {
        document: params
      }
    }

    const filter = {
      username: params.username
    }

    const data = {
      operations: operations,
      filter: filter,
    }

    await fetch(`${port}/api/register`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        document.querySelector(`.password`).value = ''
        document.querySelector(`.username`).value = ''
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
    .then(res => console.log(res))
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
            <Link to="/login">Login</Link> 
            <Link to="/register">Register</Link>
            <Link to="/recipes">Recipes</Link>
          </nav>
          <button onClick={() => {getRecipes()}}>Get Recipes</button>
        </header>
        <Routes>

          <Route path="/register" element={
            <main>
              <input className={`username`} type={`username`} placeholder={`username`}></input>
              <input className={`password`} type={`password`} placeholder={`password`}></input>
              <button onClick={() => {register()}}>Register</button>
            </main>
          }></Route>

          <Route path="/login" element={
            <main>
              <input className={`username`} type={`username`} placeholder={`username`}></input>
              <input className={`password`} type={`password`} placeholder={`password`}></input>
              <button onClick={() => {login()}}>Login</button>
            </main>
          }></Route>

          <Route path="/recipes" element={
            <main>
              {userInfo.recipes ? userInfo.recipes.map((recipe,index) => <Recipe state={state} functions={functions} recipe={recipe} key={index}></Recipe>) : <p>No Recipes Found</p>}
            </main>
          }></Route>

          <Route path="/" element={
            <main>
              <button onClick={() => {getProducts(searchBox.product)}}>Get Products</button>
              <button onClick={() => {getRecipes()}}>Get Recipes</button>
              <button onClick={() => {postRecipes()}}>Post Recipes</button>
              <input placeholder={`product`} name={`productSearchBox`} onChange={handleProductSearchBoxChange} onKeyUp={(e) => {
                if (e.key === "Enter") {
                  getProducts(searchBox.product)
                }
              }}></input>
      
              {products.filter(product => product.items[0].price).map(product => <Product product={{...product}} state={{...state}} functions={{...functions}} key={product.productId}></Product>)}
            </main>
          }></Route>

        </Routes>
      </Router>
      
      <footer>Footer</footer>
    </div>
  )
}

export default App
