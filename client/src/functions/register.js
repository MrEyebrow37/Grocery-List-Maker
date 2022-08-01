const register = async(params,state,functions) => {

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

    await fetch(`${state.port}/api/register`, {
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

export default register