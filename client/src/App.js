import './App.css'
import Product from './components/kroger-product'
import Location from './components/kroger-location'
import Recipe from './components/recipe'
import Notification from './components/notification'
import RecipeProduct from './components/recipe-product'
import Canvas from './components/canvas'
import {useEffect, useState,useLayoutEffect,useMemo} from 'react'
import {BrowserRouter as Router,Routes,Route,Link,useNavigate} from "react-router-dom"
// Import functions
import login from './functions/login'
import register from './functions/register'
import displayNotification from './functions/displayNotification'
import {getRecipes} from './functions/recipes'
import ListItem from './components/listItem'


const App = () => {

  let port = `http://localhost:4040`
  // port = `https://kroger-grocery-list-maker.herokuapp.com`
  if (process.env.NODE_ENV === `production`) {
    port = `https://kroger-grocery-list-maker.herokuapp.com`
    // setPort(`http://localhost:4040`)
  }

  // State ///////////////////////////////////////////////////////////////////////////
  const [userInfo, setUserInfo] = useState({username: "guest"})
  const [products, setProducts] = useState([])
  const [recipes,setRecipes] = useState()
  const [list,setList] = useState()
  const [locations, setLocations] = useState([])
  const [searchBox, setSearchBox] = useState({
    product: {
      brand: "",
      term: "",
      locationId: "",
      productId: "",
      fulfillment: "inStore",
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
  const [loginBox,setLoginBox] = useState({username: ``,password: ``,})
  const [registerBox,setRegisterBox] = useState({username: ``,password: ``,})

  const [notifications, setNotifications] = useState([])

  const [selectedProduct,setSelectedProduct] = useState()
  const [selectedRecipe,setSelectedRecipe] = useState()
  const [imageNumber,setImageNumber] = useState(0)
  const sortBy = [`front`,`right`,`back`,`left`,`top`,`bottom`]
  let quantity
  let unit
  let imagesArray
  const handleImageChange = (direction,length) => {
    if (direction === `right`) {
        if (imageNumber + 1 === length) {
            let newNumber = 0
            setImageNumber(newNumber)
        } else {
            let newNumber = imageNumber + 1
            setImageNumber(newNumber)
        }
    } else if (direction === `left`) {
        if (imageNumber === 0) {
            let newNumber = length - 1
            setImageNumber(newNumber)
        } else {
            let newNumber = imageNumber - 1
            setImageNumber(newNumber)
        }
    }
  }
  // console.log(selectedProduct)
  if (selectedProduct !== undefined) {
    quantity = selectedProduct.sizes[0].originalQuantity
    unit = selectedProduct.sizes[0].originalSize
    imagesArray = selectedProduct.images.flatMap(imagePerspective => {
        let index = imagePerspective.sizes.findIndex(imageSize => imageSize.size === `xlarge`)
        if (index !== -1) {
            return {...imagePerspective.sizes[index],perspective: imagePerspective.perspective}
        } else {
            index = imagePerspective.sizes.findIndex(imageSize => imageSize.size === `large`)
        }
        if (index !== -1) {
            return {...imagePerspective.sizes[index],perspective: imagePerspective.perspective}
        } else {
            index = imagePerspective.sizes.findIndex(imageSize => imageSize.size === `medium`)
        }
        if (index !== -1) {
            return {...imagePerspective.sizes[index],perspective: imagePerspective.perspective}
        } else {
            index = imagePerspective.sizes.findIndex(imageSize => imageSize.size === `small`)
        }
        if (index !== -1) {
            return {...imagePerspective.sizes[index],perspective: imagePerspective.perspective}
        } else {
            index = imagePerspective.sizes.findIndex(imageSize => imageSize.size === `thumbnail`)
        }
        if (index !== -1) {
            return {...imagePerspective.sizes[index],perspective: imagePerspective.perspective}
        }
    }).sort((a,b) => sortBy.indexOf(a.perspective) - sortBy.indexOf(b.perspective))
  }

  const usdCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })

  // console.log(searchBox.product)

  // console.log(selectedProduct)

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
    loginBox: loginBox,
    setLoginBox: setLoginBox,
    registerBox: registerBox,
    setRegisterBox: setRegisterBox,
    selectedProduct: selectedProduct,
    setSelectedProduct: setSelectedProduct,
    imageNumber: imageNumber,
    setImageNumber: setImageNumber,
    notifications: notifications,
    setNotifications: setNotifications,
    selectedRecipe,
    setSelectedRecipe,
    usdCurrency,
    list,
    setList,
  }

  // Functions ///////////////////////////////////////////////////////////////////////////

  // const navigate = useNavigate()

  const getLocations = (params) => {
    if (params.zipCode.length === 5) {
      console.log(params)
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
      setNotifications(prevState => {
        return [...prevState,{notification: `Please choose a Kroger Location to search for products.`, type: "error"}]
      })
    } else if (params.term.length < 3) {
      setNotifications(prevState => {
        return [...prevState,{notification: `Your search term must be greater than 2 characters.`, type: "error"}]
      })
    } else {
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

  const toggleLocationDropdown = (e) => {
    if (e.currentTarget.lastElementChild.classList.contains(`down`)) {
      e.currentTarget.lastElementChild.classList.remove(`down`)
      e.currentTarget.lastElementChild.classList.add(`up`)
      e.currentTarget.nextElementSibling.classList.remove(`hide`)
    } else {
      e.currentTarget.lastElementChild.classList.remove(`up`)
      e.currentTarget.lastElementChild.classList.add(`down`)
      e.currentTarget.nextElementSibling.classList.add(`hide`)
    }
  }

  const setUserLocation = (location) => {
    console.log(location.locationId)
    setUserInfo(prevState => {
      const newState = {...prevState}
      newState.krogerLocation = location.locationId
      return newState
    })
    setSearchBox(prevState => {
      const newState = {...prevState}
      newState.product.locationId = location.locationId
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
    let newRecipeTitle = recipeTitle
    if (recipeTitle === `Make new recipe`) {
      newRecipeTitle = await prompt(`Please enter the title of your recipe.`)
    } else if (recipeTitle === `Select Recipe`) {
      alert(`Please select a recipe to add this product to`)
      return
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

  const updateRecipes = async(e) => {
    const recipesToUpdate = recipes.filter(recipe => recipe.update === true)
    fetch(`${port}/api/updateRecipes`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...recipesToUpdate]),
    })
    .then(res => res.json())
    .then(res => console.log(res))
  }

  const deleteRecipes = async(e,recipe) => {
    setRecipes(prev => {
      console.log(recipe)
      const newState = [...prev].filter(prevRecipe => prevRecipe._id !== recipe._id)
      return newState
    })
    fetch(`${port}/api/deleteRecipe`, {
      method: "delete",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipe),
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
    })
  }

  const getPdf = () => {
    console.log(state.recipes)
    fetch(`${port}/api/getPdf`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({recipes: state.recipes}),
    })
    .then(res => res.blob())
    .then(res => {
      // const buffer = new ArrayBuffer(res)
      const blob = new Blob([res], { type: 'application/pdf' })
      var url = window.URL.createObjectURL(blob),
      anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "Grocery List"
      // window.open(url)
      anchor.click()
      window.URL.revokeObjectURL(blob)
    })
    .catch(e => console.log(e))
  }

  const toggleModal = (e, modal) => {
    const grayScreen = document.querySelector(`#grayScreen`)
    const recipeModal = document.querySelector(`#recipeModal`)
    const productModal = document.querySelector(`#productModal`)

    if (grayScreen.classList.contains(`hide`)) {
      grayScreen.classList.remove(`hide`)
      grayScreen.classList.add(`grayScreen`)
    } else {
      grayScreen.classList.add(`hide`)
      grayScreen.classList.remove(`grayScreen`)
    }

    if (modal === `productModal`) {
      productModal.classList.remove(`hide`)
      productModal.classList.add(`productModal`)
    } else if (modal === `recipeModal`) {
      recipeModal.classList.remove(`hide`)
      recipeModal.classList.add(`recipeModal`)
    } else {
      recipeModal.classList.remove(`recipeModal`)
      recipeModal.classList.add(`hide`)
      productModal.classList.remove(`productModal`)
      productModal.classList.add(`hide`)
    }
  }

  // const login = async(params,state,functions) => {

  //   console.log(params,state)

  //   state.setLoginBox({username: ``,password: ``,})

  //   const operations = {
  //     insertOne: {
  //       document: params
  //     }
  //   }

  //   const filter = {
  //     username: params.username
  //   }

  //   const data = {
  //     operations: operations,
  //     filter: filter,
  //     params: params,
  //   }

  //   await fetch(`${state.port}/api/login`, {
  //       method: "post",
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(data)
  //     })
  //     .then(res => res.json())
  //     .then(async res => {
  //       if (res.response === `Success!`) {
  //         await state.setUserInfo({username: params.username, krogerLocation: res.krogerLocation})
  //         await state.setSearchBox(prevState => {
  //           const newState = {...prevState}
  //           newState.product.locationId = res.krogerLocation
  //           return newState
  //         })
  //         // navigate(`/`)
  //       } else {
  //         console.log(res)
  //       }
  //       functions.getRecipes({username: document.querySelector(`.username`).value},{...state.searchBox.product,locationId: res.krogerLocation},state,functions)
  //     })
  //     .catch(e => console.log(e))
  // }

  const functions = {
    getLocations: getLocations,
    getProducts: getProducts,
    getRecipes: getRecipes,
    handleProductSearchBoxChange: handleProductSearchBoxChange,
    handleZipCodeSearchBoxChange: handleZipCodeSearchBoxChange,
    setUserLocation: setUserLocation,
    addToRecipe: addToRecipe,
    updateRecipes: updateRecipes,
    deleteRecipes: deleteRecipes,
    getPdf: getPdf,
    toggleModal,
    // navigate: navigate(),
  }

  return (
    <div className="App">
      <Router>
        <header>
          <Link className={`navLink`} to="/">Grecipe</Link>
          <div className={`locationsSelector`}>
            <div className={`navLink`} onClick={(e) => {toggleLocationDropdown(e)}}>
              <p>Find a Kroger</p>
              <div id={`krogerLocationArrow`} className='arrow down'></div>
            </div>
            <div className={`dropdown hide`}>
              <input placeholder={`Zip Code`} name={`zipCodeSearchBox`} onChange={handleZipCodeSearchBoxChange} onKeyUp={(e) => {
                if (e.key === "Enter") {
                  getLocations(searchBox.location)
                }
              }}></input>
              <button onClick={() => {getLocations(searchBox.location)}}>Search</button>
              {locations.map(location => <Location location={{...location}} state={{...state}} functions={{...functions}} key={location.locationId}></Location>)}
            </div>
          </div>
          <nav>
            <Link className={`navLink`} to="/">Home</Link>
            <Link className={`navLink`} to="/recipes">Recipes</Link>
            <Link className={`navLink`} to="/list">List</Link>
            <Link className={`navLink`} to="/login">Login</Link>
            {/* <Link className={`navLink`} to="/register">Register</Link> */}
          </nav>
          {/* <button onClick={() => {getRecipes({username: userInfo.username},searchBox.product,state,functions)}}>Get Recipes</button> */}
          {/* <button onClick={() => {getPdf()}}>Get PDF</button> */}
        </header>

        <div className={`notificationWrapper`}>
              {notifications ? notifications.map((notification,index) => {
                return <Notification key={index} index={index} state={state} functions={functions} notification={notification}></Notification>
              }) : <div></div>}
        </div>

        <div id={`grayScreen`} onClick={(e) => {toggleModal(e, null)}} className={`hide`}></div>

        <div id={`productModal`} onClick={(e) => {e.stopPropagation()}} className={`hide`}>
          {selectedProduct !== undefined && <div className={`innerProductModal`}>
              <button className={`productModalLeftButton`} onClick={() => {handleImageChange(`left`,imagesArray.length)}}>{`<`}</button>
              <img className={`productModalImage`} src={imagesArray[imageNumber].url} alt="image" />
              <button className={`productModalRightButton`} onClick={(e) => {handleImageChange(`right`,imagesArray.length)}}>{`>`}</button>
              <button className={`productModalCloseModal`} onClick={(e) => {toggleModal(e)}}>X</button>
              <p className={`productModalDescription`}>{`${selectedProduct.description}`}</p>
              <div className={`productInfo`}>
                <p className={`productModalRegPrice`}>{`Regular Price: ${state.usdCurrency.format(selectedProduct.items[0].price.regular)}`}</p>
                <p className={`productModalSize`}>Size: {selectedProduct.items[0].size}</p>
              </div>
              <div className={`recipeInfo`}>

                <div className={`productModalQuantity`}>
                  <p>Quantity:</p>
                  <input defaultValue={quantity} placeholder={`Quantity`} onChange={(e) => {quantity = e.target.value}}></input>
                </div>

                <div className={`productModalUnit`}>
                  <p>Unit</p>
                  <select onChange={(e) => {unit = e.target.value}}>
                      {selectedProduct.sizes.map((size,index) => {
                          // return <option key={index}>
                          //     {size.size}
                          // </option>
                          if (size.size === size.originalSize) {
                              return <option selected key={index}>
                                  {size.size}
                              </option>
                          } else {
                              return <option key={index}>
                                {size.size}
                            </option>
                          }
                      })}
                  </select>
                </div>

                <div className={`productModalRecipePrice`}>
                  <p>{`${selectedProduct.items[0].price.regular}`}</p>
                </div>

                <div className={`productModalRecipeSelector`}>
                  <p>Recipe:</p>
                  <select className={`recipeSelector id${selectedProduct.productId}`}>
                      <option>Make new recipe</option>
                      {state.recipes.map((recipe,index) => {
                          if (recipe.title) {
                            return <option key={index}>{recipe.title}</option>
                          } else {
                            return
                          }
                      })}
                  </select>
                </div>
                <button className={`productModalAddToRecipe`} onClick={() => {functions.addToRecipe({recipeTitle: document.querySelector(`.id${selectedProduct.productId}`).value, product: selectedProduct, quantityInRecipe: Number(quantity), sizeInRecipe: unit})}}>Add</button>
              </div>
          </div>}
        </div>

        <div id={`recipeModal`} onClick={(e) => {e.stopPropagation()}} className={`hide`}>
          {selectedRecipe ? <div className={`innerRecipeModal`}>
            {Object.values(selectedRecipe.products).map((product,index) => {
              return <RecipeProduct recipe={selectedRecipe} product={product} state={state} functions={functions} key={index}></RecipeProduct>
            })}
          </div> : <p>Sorry</p>}
        </div>
        
        <Routes>

          <Route path="/register" element={
            <main>
              <div className={`loginRegisterOuterContainer`}>
                <div className={`loginRegisterInnerContainer`}>
                  <input onChange={(e) => {state.setRegisterBox({...state.registerBox,username: e.target.value})}} name={`username`} className={`username`} type={`username`} placeholder={`username`} value={state.registerBox.username}></input>
                  <input onChange={(e) => {state.setRegisterBox({...state.registerBox,password: e.target.value})}} name={`password`} className={`password`} type={`password`} placeholder={`password`} value={state.registerBox.password}></input>
                  <button onClick={() => {register({password: document.querySelector(`.password`).value, username: document.querySelector(`.username`).value.toLowerCase()},state,functions)}}>Register</button>
                  <p style={{"color": "white"}}>Already have an account? <strong><Link className={`nonNavLink`} to="/login">Login Here</Link></strong></p>
                </div>
              </div>
            </main>
          }></Route>

          <Route path="/login" element={
            <main>
              <div className={`loginRegisterOuterContainer`}>
                <div className={`loginRegisterInnerContainer`}>
                  <input onChange={(e) => {state.setLoginBox({...state.loginBox,username: e.target.value})}} className={`username`} type={`username`} placeholder={`username`} value={state.loginBox.username}></input>
                  <input onChange={(e) => {state.setLoginBox({...state.loginBox,password: e.target.value})}} className={`password`} type={`password`} placeholder={`password`} value={state.loginBox.password}></input>
                  <button onClick={() => {login({password: document.querySelector(`.password`).value, username: document.querySelector(`.username`).value.toLowerCase()},state,functions)}}>Login</button>
                  <p style={{"color": "white"}}>Don't have an account? <Link className={`nonNavLink`} to="/register">Register Here</Link></p>
                </div>
              </div>
            </main>
          }></Route>

          <Route path="/recipes" element={
            <main className={`mainRecipes`}>
              <div className={`recipeWrapper`}>
                {recipes ? recipes.map((recipe,index) => <Recipe state={state} functions={functions} recipe={recipe} key={index}></Recipe>) : <p>Sorry, no recipes found</p>}
              </div>
              {recipes ? <button onClick={(e) => updateRecipes(e)}>Update Recipes</button> : <div></div>}
            </main>
          }></Route>

          <Route path="/list" element={
            <main className={`mainList`}>
              <div className={`listWrapper`}>
                {list ? list.map(listItem => <ListItem listItem={listItem} state={state} functions={functions}></ListItem>) : <p>Sorry, no items added to list.</p>}
              </div>
            </main>
          }></Route>

          <Route path="/canvas" element={
            <main>
              <Canvas />
            </main>
          }></Route>

          <Route path="/" element={
            <main className={`mainHome`}>
              <div>
                <input placeholder={`product`} name={`productSearchBox`} onChange={handleProductSearchBoxChange} onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    getProducts(searchBox.product)
                  }
                }}></input>
                <button onClick={() => {getProducts(searchBox.product)}}>Search</button>
              </div>

              {/* <button onClick={() => {getRecipes({username: userInfo.username},searchBox.product,state,functions)}}>Get Recipes</button> */}
              <div className={`productWrapper`}>
                {products.filter(product => product.items[0].price && product.sizes[0]).map((product,index) => <Product product={{...product}} state={{...state}} functions={{...functions}} key={index}></Product>)}
              </div>
            </main>
          }></Route>

          <Route path='/*' element={
            <main>
              <div className={`loginRegisterOuterContainer`}>
                <div className={`loginRegisterInnerContainer`}>
                  <p style={{"color": "white"}}>Sorry, page not found. <br/><Link className={`nonNavLink`} to="/">Home</Link></p>
                </div>
              </div>
            </main>
          }
          ></Route>

        </Routes>
      </Router>
      
      <footer>Footer</footer>
    </div>
  )
}

export default App
