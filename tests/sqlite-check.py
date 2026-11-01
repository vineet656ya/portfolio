import sqlite3,pathlib,re,json
connection=sqlite3.connect(':memory:')
connection.executescript(pathlib.Path('drizzle/0000_mixed_kronos.sql').read_text())
source=pathlib.Path('lib/platform.ts').read_text()
query=re.search(r'prepare\(`(INSERT INTO records[^`]+)`\)',source).group(1)
now=1000000
for i in range(8):
 result=connection.execute(query,('rate-contact-ip',now+600000,now,now,now+600000,now,8)).fetchone()
 assert result is not None
assert connection.execute(query,('rate-contact-ip',now+600000,now,now,now+600000,now,8)).fetchone() is None
later=now+600001
assert connection.execute(query,('rate-contact-ip',later+600000,later,later,later+600000,later,8)).fetchone() is not None
payload=json.loads(connection.execute('select data from records').fetchone()[0])
assert payload['count']==1
print('D1 migration and atomic rate-limit SQL passed.')
