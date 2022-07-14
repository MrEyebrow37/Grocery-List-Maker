import {useState} from 'react'

const Product = ({product,state,functions}) => {
    const [quantity, setQuantity] = useState(1)

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value)
    }

    return (
        <div>
            <details>
                <summary>
                    <p>{`${product.description} $${product.items[0].price.regular}`}</p>
                    <p>Size: {product.items[0].size}</p>
                    <img src={product.images[0].sizes[1].url} alt="image" width="42" height="42"></img>
                </summary>
                {state.userInfo.recipes.map(recipe => {
                    return <button onClick={(e) => {
                        functions.addToRecipe({recipeTitle: e.target.childNodes[0].data, product: product, quantityInRecipe: Number(quantity)})
                    }}>{recipe.title}</button>
                })}
                <button onClick={async() => {
                    const recipeTitle = await prompt("Please enter the title of your recipe.")
                    functions.addToRecipe({recipeTitle: recipeTitle, product: product, quantityInRecipe: Number(quantity)})
                }}>Make New Recipe</button>
                Add
                <select onChange ={(e) => {handleQuantityChange(e)}}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                </select>
                to Recipe
            </details>
        </div>
    )
}

export default Product