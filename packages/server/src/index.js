import path from 'path'
import Fastify from 'fastify';
import FastifyStatic from 'fastify-static'
import {assistantHandler} from "./handlers.js";

const buildPath = path.join(process.cwd(), '../frontend/build')
console.log(buildPath)

const app = Fastify({
  logger: true,
})

app.post('/google-assistant', assistantHandler)

app.register(FastifyStatic, {
  root: buildPath,
  wildcard: false,
})

app.get('/*', function (req, reply) {
  console.log(path.join(buildPath, 'index.html'))
  return reply.sendFile('index.html', { cacheControl: false }) // overriding the options disabling cache-control headers
})

app.listen(Number(process.env.PORT ?? '4444'), '0.0.0.0', (err, addr) => {
  if(err) console.error("Error while listening for http requests:", err)
  console.info("listening for http requests:", addr)
})
