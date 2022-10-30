import {useState,useEffect} from 'react'

const Product = ({product,state,functions}) => {
    // console.log(product)
    const [quantity, setQuantity] = useState(product.sizes[0].originalQuantity)
    const [unit,setUnit] = useState(product.sizes[0].originalSize)
    const [imageNumber,setImageNumber] = useState(0)

    const sortBy = [`front`,`right`,`back`,`left`,`top`,`bottom`]

    const imagesArray = product.images.flatMap(imagePerspective => {
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

    return (
        <div className={`krogerProduct`}>
            {/* <div> */}
                <p className={`productDescription cursor-pointer`} onClick={(e) => {
                    functions.toggleModal(e,`productModal`)
                    state.setSelectedProduct(product)
                    state.setImageNumber(imageNumber)
                }}>{`${product.description}`}</p>
                <div className={`krogerProductHeader`}>
                    <button onClick={() => {handleImageChange(`left`,imagesArray.length)}}>{`<`}</button>
                    <img onClick={(e) => {
                        functions.toggleModal(e,`productModal`)
                        state.setSelectedProduct(product)
                        state.setImageNumber(imageNumber)
                    }} className={`cursor-pointer productImage`} src={imagesArray[imageNumber].url} alt="image" width="200" height="200"></img>
                    <button onClick={() => {handleImageChange(`right`,imagesArray.length)}}>{`>`}</button>
                </div>
                <div className={`productDetails`}>
                    <p>{`Price: ${state.usdCurrency.format(product.items[0].price.regular)}`}</p>
                    <p>Size: {product.items[0].size}</p>
                </div>
                <div className={`productSpacer`}></div>
            {/* </div> */}
        </div>
    )
}

export default Product