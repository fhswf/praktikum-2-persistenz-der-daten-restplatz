import express from 'express';
import DB from './db.js'
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';



// Passport.js JWT-Strategie
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyn2vP592Ju/iKXQW1DCrSTXyQXyo11Qed1SdzFWC+mRtdgioKibzYMBt2MfAJa6YoyrVNgOtGvK659MjHALtotPQGmis1VVvBeMFdfh+zyFJi8NPqgBTXz6bQfnu85dbxVAg95J+1Ud0m4IUXME1ElOyp1pi88+w0C6ErVcFCyEDS3uAajBY6vBIuPrlokbl6RDcvR9zX85s+R/s7JeP1XV/e8gbnYgZwxcn/6+7moHPDl4LqvVDKnDq9n4W6561s8zzw8EoAwwYXUC3ZPe2/3DcUCh+zTF2nOy8HiN808CzqLq1VeD13q9DgkAmBWFNSaXb6vK6RIQ9+zr2cwdXiwIDAQAB
-----END PUBLIC KEY-----`,
    ignoreExpiration: true,
    issuer: "https://jupiter.fh-swf.de/keycloak/realms/webentwicklung"
};





// Validation
import { check, validationResult } from 'express-validator';


  // Swagger Anfang

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Todo API',
        version: '1.0.0',
        description: 'Todo API Dokumentation',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        schemas: {
          Todo: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
              },
              due: {
                type: 'string',
              },
              status: {
                type: 'integer',
              },
            },
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        },
      },
      security: [{
        bearerAuth: []
      }]
    },
    apis: ['./index.js'], 
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);

  // Swagger Ende


// Validation
const todoValidationRules = [
    check('title')
      .notEmpty()
      .withMessage('Titel darf nicht leer sein')
      .isLength({ min: 3 })
      .withMessage('Titel muss mindestens 3 Zeichen lang sein'),
  ];




const PORT = process.env.PORT || 3000;

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();
app.use(express.json());

/** global instance of our database */
let db = new DB();

app.use(passport.initialize());

/** Initialize database connection */
async function initDB() {
    await db.connect();
    console.log("Connected to database");
}

// implement API routes

// SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/** Return all todos. 
 *  Be aware that the db methods return promises, so we need to use either `await` or `then` here! 
 */

/**
 * @swagger
 * /todos:
 *  get:
 *    summary: Gibt alle Todos zurück
 *    tags: [Todos]
 *    responses:
 *      '200':
 *        description: Eine Liste aller Todos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Todo'
 */


passport.use(
    new JwtStrategy(opts, (payload, done) =>  {
        // Hier können Sie zusätzliche Validierungen oder Benutzerabfragen durchführen, falls erforderlich
        console.log("JWT payload: %o", payload)
        return done(null, payload);
    })
);


app.get('/todos', async (req, res) => {
    let todos = await db.queryAll();
    res.send(todos);
});


// GET /todos/:id
app.get('/todos/:id', async (req, res) => {
    const todo = await db.queryById(req.params.id);
    if (Object.keys(todo).length === 0) {
        res.status(404).send({ error: 'Todo not found' });
    } else {
        res.send(todo);
    }
});



// Create  POST /todos
app.post('/todos', todoValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }



    const result = await db.insert(req.body);
    console.log(result);
    res.send(result);
});


// Update PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
    const ret = await db.update(req.params.id, req.body);
    res.send(ret);
});


// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
    let ret = await db.delete(req.params.id);
    res.send(ret);
});






initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    })