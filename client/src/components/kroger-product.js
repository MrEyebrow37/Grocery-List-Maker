import {useState} from 'react'

const Product = ({product,state,functions}) => {
    const [quantity, setQuantity] = useState(1)

    console.log(product.sizes[0])



    const handleQuantityChange = (e) => {
        setQuantity(e.target.value)
    }

    return (
        <div>
            <details>
                <summary>
                    <img src={product.images[0].sizes[1].url} alt="image" width="200" height="200"></img>
                    <br/>
                    <p>{`${product.description} $${product.items[0].price.regular}`}</p>
                    <p>Size: {product.items[0].size}</p>
                </summary>

                {state.recipes.map((recipe,index) => {
                    return <button key={index}onClick={(e) => {
                        functions.addToRecipe({recipeTitle: e.target.childNodes[0].data, product: product, quantityInRecipe: Number(quantity)})
                    }}>{recipe.title}</button>
                })}
                <button onClick={async() => {
                    const recipeTitle = await prompt("Please enter the title of your recipe.")
                    functions.addToRecipe({recipeTitle: recipeTitle, product: product, quantityInRecipe: Number(quantity)})
                }}>Make New Recipe</button>
                Add
                <input onChange ={(e) => {handleQuantityChange(e)}}></input>
                <select>
                    {product.sizes[0].map((size,index) => {
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
                to Recipe
            </details>
        </div>
    )
}

export default Product