const express = require('express'); //importa o pacote express
const cors = require('cors'); //importa o pacote cors
const { MongoClient } = require('mongodb'); //importa o mongodb

const aplicativolinks = express();
const client = new MongoClient('mongodb+srv://eduardotrova01:0VhaXSK7CkQrWrjX@desafiolayers.wr7lkc0.mongodb.net/?retryWrites=true&w=majority')
const db = client.db('shorturl')

aplicativolinks.use(express.json());
aplicativolinks.use(cors());

function generateShortUrl() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortUrl = '';
  
    for (let i = 0; i < 6; i++) {
      shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return shortUrl;
  }

function isValidLink(url) {
  const regex = /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/?].*)?$/;
  return regex.test(url); 
}

aplicativolinks.get('/links', async function (req, res) {
  const links = await db.collection('links').find().toArray();
  res.json(links);
}) 


aplicativolinks.post('/shorten', function (req, res)  {
  const  longUrl = req.body.longUrl;
  const  nome = req.body.nome;
  const shortUrl = generateShortUrl();
  if (isValidLink(longUrl)) {
    const link = {
      shortUrl: nome || shortUrl,
      longUrl,
      visitas: 0
    }
    db.collection('links').insertOne(link)
  
    const shortenedUrl = req.protocol + '://' + req.hostname + ':' + req.socket.localPort + '/' + link.shortUrl
  
    res.json({ shortenedUrl });
  } else {
    res.status(400).json({ error: 'O link enviado é inválido' });
  }
  
});

aplicativolinks.get('/:shortUrl', async function (req, res) {
  const shortUrl = req.params.shortUrl;
  const link = await db.collection('links').findOne({ shortUrl });

  if (link) {
    await db.collection('links').updateOne({ shortUrl }, { $set:{ visitas: link.visitas+1 } })
    console.log(link);
    res.redirect(link.longUrl);
  } else {
    res.status(404).json({ error: 'Link não encontrado' });
  }
});

const PORT = 3000;
aplicativolinks.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

