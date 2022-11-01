export default function handler(req, res) {

    const tokenId = req.query.tokenId;
    const imageUrl = "https://raw.githubusercontent.com/Web3Wiz/NFTCollection/main/nextapp/public/cryptodevs/";


    res.status(200).json({
        name: 'Crypto Dev #' + tokenId,
        description: "Crypto Dev is a NFT collection for developers in Crypto",
        image: imageUrl + (parseInt(tokenId)-1) + ".svg"
    })
}
