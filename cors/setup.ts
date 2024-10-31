

const allowlist = [
  "http://mattbudd.co.uk",
  "https://mattbudd.co.uk",
]
export const corsOptionsDelegate = function (req: any, callback: any) {
  let corsOptions
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
