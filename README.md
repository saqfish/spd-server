## Config

Make a `defaults.json` file with the following values:
1. `PORT`: The port the server will run on
2. `ROOMPREFIX`: The prefix the server will use on all depth rooms
3. `SEED`: The seed that will be sent to all players
4. `keys`: a set of authorized player keys

## Example

```json
{
	"PORT": 5800,
	"ROOMPREFIX": "spdnet",
	"SEED": 123456789,
	"keys": [
		{
			"key": "fewfslf3of0",
			"nick": "player"
		}
	]
  ```

## Running

`npm run start`
