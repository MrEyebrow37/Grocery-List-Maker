import {useState,useEffect,useMemo} from 'react'

const RecipeProduct = ({product,recipe,state,functions}) => {
    // const quantity = product.quantityInRecipe
    // const size = product.sizes.find(size => size.size === product.sizeInRecipe)
    let price = useMemo(() => product.sizes.find(size => size.size === product.sizeInRecipe).pricePerThisSize*product.quantityInRecipe)
    const [imageNumber,setImageNumber] = useState(0)

    useEffect(() => {
        price = product.sizes.find(size => size.size === product.sizeInRecipe).pricePerThisSize*product.quantityInRecipe
    })


    let imagePerspective
    if (product.krogerInfo.images.some(image => image.perspective === `front`)) {
        imagePerspective = `front`
    } else if (product.krogerInfo.images.some(image => image.perspective === `top`)) {
        imagePerspective = `top`
    } else if (product.krogerInfo.images.some(image => image.perspective === `right`)) {
        imagePerspective = `right`
    } else if (product.krogerInfo.images.some(image => image.perspective === `left`)) {
        imagePerspective = `left`
    } else if (product.krogerInfo.images.some(image => image.perspective === `back`)) {
        imagePerspective = `back`
    }

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
        <div>
            <details>
                <summary>
                    <button onClick={() => {handleImageChange(`left`,imagesArray.length)}}>{`<`}</button>
                    <img src={imagesArray[imageNumber].url} alt="image" width="200" height="200"></img>
                    <button onClick={() => {handleImageChange(`right`,imagesArray.length)}}>{`>`}</button>
                    <br/>
                    <p>{`${product.krogerInfo.description} $${product.krogerInfo.items[0].price.regular}`}</p>
                    <p>Size: {product.krogerInfo.items[0].size}</p>
                </summary>
                <input defaultValue={product.quantityInRecipe} onChange ={(e) => {handleProductChange(e,`quantity`)}}></input>
                <select onChange={(e) => {handleProductChange(e,`size`)}}>
                    {product.sizes.map((size,index) => {
                        if (size.size === product.sizeInRecipe) {
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
                <p>{price}</p>
            </details>
        </div>
    )
}

export default RecipeProduct