export default async function usage() {
  console.log(`

USAGE:

  val                   - start the validator
  val -d                - start the validator as a background service
  val save [alias]      - save the validator state to an alias
  val [alias]           - start the validator from the alias state
  val clean             - clean the validator state removing working files
  val list              - list the saved snapshots
  val status            - check on the status of the validator

FLAGS:
  --background, -d      - start the validator as a background process
  --help, -h            - show this message
  --quiet, -q           - suppress output
`);
}
