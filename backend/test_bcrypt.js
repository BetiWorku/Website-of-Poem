const bcrypt = require('bcryptjs');

async function test() {
    try {
        await bcrypt.compare(undefined, 'somestring');
        console.log("Success with undefined");
    } catch (err) {
        console.error("Error from bcrypt with undefined:", err.message);
    }
}

test();
