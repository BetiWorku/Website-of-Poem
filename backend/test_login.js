fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'bwwmas@gmail.com', password: '12345678' })
})
    .then(res => res.text())
    .then(text => console.log('Response:', text))
    .catch(err => console.error('Error:', err));
