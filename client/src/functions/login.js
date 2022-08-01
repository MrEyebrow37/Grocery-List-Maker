const login = async(params,state,functions) => {

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

    await fetch(`${state.port}/api/login`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        if (res.response === `Success!`) {
          state.setUserInfo({username: params.username, krogerLocation: res.krogerLocation})
          state.setSearchBox(prevState => {
            const newState = {...prevState}
            newState.product.locationId = res.krogerLocation
            return newState
          })
        } else {
          console.log(res)
        }
        document.querySelector(`.password`).value = ''
        document.querySelector(`.username`).value = ''
      })
      .catch(e => console.log(e))
      console.log(state.userInfo.username)
      functions.getRecipes({username: state.userInfo.username},state,functions)
}

export default login