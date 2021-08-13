## Config

Make a `config.json` file with the following values:
1. `port`: the port the server will run on
2. `roomprefix`: The prefix the server will use on all depth rooms
3. `seed`: the seed that will be sent to all players
4. `itemSharing`: if item sharing should be enabled
5. `accounts`: a set of authorized player keys

## Example `config.json`

```json
{
	"port": 5800,
	"roomprefix": "spdnet",
	"seed": 123456789,
	"itemSharing": true,
	"accounts": [
		{ "key": "1234567890", "nick": "player1" },
		{ "key": "abcdefghij", "nick": "player2" }
	]
}
  ```

## Records

This directory will contain a `records.json` file. Player wins will be stored here. This file should not be directly edited.

Create the `records.json` file with the following entry. If you would like to remove all player wins, return the file to this state.

```json
{}
```
