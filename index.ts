import express, { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';

const app = express();
const prisma = new PrismaClient();
const pergunta = prisma.pergunta;
const resposta = prisma.resposta;

app.set('view engine', 'ejs') //delimita o template engine de HTML
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.listen(4000, () => {
  console.log("App running")
}); 

//lista as perguntas
app.get('/', (req: Request, res: Response) => {
  pergunta.findMany({
    orderBy: [{
      id: 'desc'
    }]
  }).then((perguntas) => {
    res.render('index', {
      perguntas: perguntas
    }) 
  })
})

//realizar pergunta
app.get('/perguntar', (req: Request, res: Response) => {
  res.render("perguntar")
})

//salva no banco a pergunta
//melhor forma para isolar os parametros do create e reutilizar?
app.post('/salvarpergunta', (req: Request, res: Response) => {
  let { titulo, descricao } = req.body
  pergunta.create({
    data:{
       title: titulo, 
       description: descricao,
    }
  }).then(() => res.redirect('/'));
})

//lista perguntas por id
//tratamento para paramentros NaN - faltando adicionar
app.get('/pergunta/:id', (req: Request, res: Response) => {
  let { id } = req.params
  pergunta.findFirst({
    where: {
      id: Number(id)
    }
  }).then((pergunta) => {
    if(pergunta != undefined){
      resposta.findMany({
        where: {
          perguntaId: pergunta.id
        }, orderBy: {
          id: 'desc'
        }
      }).then((respostas) => {
        res.render('pergunta', {
          pergunta: pergunta,
          respostas: respostas
        })
      })
    }else{
      res.redirect('/')
    }
  })
})

app.post('/responder', (req: Request, res: Response) =>{ 
  let { answer_body, perguntaId  } = req.body;
  resposta.create({
    data: {
      answerBody: answer_body,
      perguntaId: Number(perguntaId)
    }
  }).then(() => {
    res.redirect(`/pergunta/${perguntaId}`)
  })
})


