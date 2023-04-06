# express-session-wrapper

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]

> A package that extends the functionality of the express-session

## Features

- simplified api
- promises support
- absolute timeout

## Install

```bash
npm i express-session-wrapper
```

## Usage

```js
import express from "express"
import { configureSessionWrapper } from "express-session-wrapper";

const PORT = 5500;

const app = express();

app.use(express.json());
app.use(
    session({
        // your config
    })
);
app.use(
    configureSessionWrapper({
        absoluteTimeoutInMilliseconds: 1 * 60 * 1000,
    })
);

app.get("/login", async (req, res) => {
    await req.sessionWrapper.createSession({userId:"userid"});
    res.send("Logged in successfully");
});

app.get("/getUserId", (req, res) => {
    const sessionData = req.sessionWrapper.getSessionDataIfExists();
    if(!sessionData){
        return res.status(401).send("Unauthorized")
    }
    res.send(sessionData.userId);
});

app.listen(PORT, async () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
```

## Typescript support
Create .d.ts file in your root directory and place the following code in it.
```typescript
import "express-session-wrapper";

declare module "express-session-wrapper" {
  interface SessionWrapperData {
    //add your fields
  }
}
```

## API

### configureSessionWrapper

```js
import { configureSessionWrapper } from "express-session-wrapper";
app.use(configureSessionWrapper(options))
```

#### Options

`absoluteTimeoutInMilliseconds?`

Default: undefined

| Value     | Description                                                                                                                                                    |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| number    | Absolute timeout in milliseconds. See [owasp](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#automatic-session-expiration) |
| undefined | Absolute timeout is disabled                                                                                                                                   |

#### req.sessionWrapper

`createSession(sessionData)`

Creates new session and saves given session data to the store. It also regenerates session id. <br>
Returns empty promise

`destroySession()`

Destroys existing session <br>
Returns empty promise

`getSessionDataIfExists()`

Returns saved session data  <br>
When session does not exist, it returns **false**

[downloads-img]:https://img.shields.io/npm/dt/express-session-wrapper
[downloads-url]:https://www.npmtrends.com/express-session-wrapper
[npm-img]:https://img.shields.io/npm/v/express-session-wrapper
[npm-url]:https://www.npmjs.com/package/express-session-wrapper

