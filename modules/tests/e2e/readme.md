Suggested testing architecture

| file              | description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `specs/*.spec.ts` | Test cases                                                                |
| `./dsl/*`         | Shared dsl (small functions defined in terms of abstract test steps)      |
| `./drivers/*`     | Protocol driver functions (page objects, api objects, mobile testing lib) |

The point of setting this up like this is so that as our interface changes our usecases do not and vice versa
