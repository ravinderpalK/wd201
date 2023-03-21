
const time = async (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

const fetchUserDetails = async (userId) => {
    console.log("Fetching user data. ");
    await time(500);
    return `http://image.example.com/${userId}`;
};

const downloadImage = async (imageUrl) => {
    console.log("Downloading image. ");
    await time(500);
    return `Image${imageUrl}`;
};

const render = async (image) => {
    await time(300);
    console.log("Render image.");
};

const run = async () => {
    const imageUrl = await fetchUserDetails("john");
    const image = await downloadImage(imageUrl);
    await render(image);
};

run();

// fetchUserDetails("john", (imageUrl) => {
//     downloadImage(imageUrl, (image)=> {
//         render(image);
//     })
// });

// fetchUserDetails("john")
// .then((imageUrl) => downloadImage(imageUrl))
// .then((image) => render(image))
// .catch((error) => {
//     console.log("error");
// });
