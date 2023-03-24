

import axios from 'axios';


axios.post('http://localhost:3000/todo', {
    title: 'John Doe',
    due: 'johndoe@example.com',
    status: 'mypassword'
})
.then(function (response) {
    console.log(response.data);
})
.catch(function (error) {
    console.log(error);
});

