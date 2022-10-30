import {useState,useEffect,useMemo} from 'react'

const RecipeProduct = ({product,recipe,state,functions}) => {
    let price = useMemo(() => product.sizes.find(size => size.size === product.sizeInRecipe).pricePerThisSize*product.quantityInRecipe)
    const [imageNumber,setImageNumber] = useState(0)
    // console.log(product)
    // console.log(recipe)
    // useEffect(() => {
    //     price = product.sizes.find(size => size.size === product.sizeInRecipe).pricePerThisSize*product.quantityInRecipe
    // })

    const sortBy = [`front`,`right`,`back`,`left`,`top`,`bottom`]

    const imagesArray = product.krogerInfo.images.flatMap(imagePerspective => {
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

    const handleProductChange = async(e,parameterToChange) => {
        await state.setRecipes(prev => {
            const newState = [...prev]
            const foundRecipe = newState.find(stateRecipe => stateRecipe._id === recipe._id)
            foundRecipe.update = true
            const foundProduct = Object.values(foundRecipe.products).find(stateProduct => stateProduct.krogerInfo.productId === product.krogerInfo.productId)
            if (parameterToChange === `quantity`) {
                foundProduct.quantityInRecipe = e.target.value
            } else if (parameterToChange === `size`) {
                foundProduct.sizeInRecipe = e.target.value
            }
            return newState
        })
    }

    return (
        <div className={`krogerProduct`}>
            {/* <div> */}
                <p className={`productDescription`}>{`${product.krogerInfo.description}`}</p>
                <div className={`krogerProductHeader`}>
                    <button onClick={() => {handleImageChange(`left`,imagesArray.length)}}>{`<`}</button>
                    <img className={`productImage`} src={imagesArray[imageNumber].url} alt="image" width="200" height="200"></img>
                    <button onClick={() => {handleImageChange(`right`,imagesArray.length)}}>{`>`}</button>
                </div>
                <div className={`productDetails`}>
                    <p>{`Store Price: ${state.usdCurrency.format(product.krogerInfo.items[0].price.regular)}`}</p>
                    <p>Store Size: {product.krogerInfo.items[0].size}</p>
                    <p>Quantity in Recipe: <input value={product.quantityInRecipe} onChange={(e) => {
                        state.setRecipes(prev => {
                            const newState = [...prev]
                            newState.find(oldRecipe => oldRecipe._id === recipe._id).products[product.krogerInfo.productId].quantityInRecipe = e.target.value
                            return newState
                        })
                        state.setSelectedRecipe(prev => {
                            const newState = {...prev}
                            newState.products[product.krogerInfo.productId].quantityInRecipe = e.target.value
                            return newState
                        })
                    }}></input></p>
                    <p>Size in Recipe: <select value={product.sizeInRecipe} onChange={(e) => {
                            state.setRecipes(prev => {
                                const newState = [...prev]
                                newState.find(oldRecipe => oldRecipe._id === recipe._id).products[product.krogerInfo.productId].sizeInRecipe = e.target.value
                                return newState
                            })
                            state.setSelectedRecipe(prev => {
                                const newState = {...prev}
                                newState.products[product.krogerInfo.productId].sizeInRecipe = e.target.value
                                return newState
                            })
                            }}>
                            {product.sizes.map((size,index) => {
                                return <option key={index}>{size.size}</option>
                            })}
                        </select>
                    </p>
                    <p>Price: {state.usdCurrency.format(price)}</p>
                </div>
                <div className={`productSpacer`}></div>
            {/* </div> */}
        </div>
    )
}

export default RecipeProduct