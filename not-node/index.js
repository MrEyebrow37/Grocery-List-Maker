const CLIENT_ID="grocerylistmaker-3637fe7228b995c5c4a65307f9a07e2f145795002684414219"
const CLIENT_SECRET="4-4vNN3ZyaYgjwhMzVETfrgWsal-uPNkDoaeg2B2"
const OAUTH2_BASE_URL="https://api.kroger.com/v1/connect/oauth2/"
const API_BASE_URL="https://api.kroger.com/"
const REDIRECT_URL="http://localhost:3000/callback/"

const getResponse = async() => {
    let auth = new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const response = await fetch(`${OAUTH2_BASE_URL}token`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Basic ${auth}`
        },
        'Content-Type': 'application/x-www-form-urlencoded',
    })
    return response
}
console.log(getResponse())
getResponse
.then(res => console.log(res))
.catch(res => console.log(res))