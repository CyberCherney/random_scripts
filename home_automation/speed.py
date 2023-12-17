# A script I made to check the internet speed I have then track that in a database
# Great for if you suspect your ISP is throttling you
import mariadb
import speedtest
import datetime
from pytz import timezone

st = speedtest.Speedtest()
st.get_best_server()
x = datetime.datetime.now(timezone("America/Chicago"))
stamp = x.strftime("%x %X")

def speedtest():
    latency = st.results.ping
    down = st.download()/1000000
    up = st.upload()/1000000
    return down, up, latency

def sql_update(down, up, latency):
    mydb = mariadb.connect(
        host='localhost',
        user='raccoon',
        password='',
        database='home'
    )
    mycursor = mydb.cursor()

    sql = "INSERT INTO speed (download, upload, latency, Time) VALUES (%s, %s, %s, %s)"
    val = (down, up, latency, stamp)
    mycursor.execute(sql, val)

    mydb.commit()

def main():
    down, up, latency = speedtest()
#    print(round(down,1), round(up,1), round(latency,1), sep=',')
    try:
#        down='debug'
        int(down)
        sql_update(round(down,1), round(up,1), round(latency,1))
    except ValueError:
#        print('Exit successful!')
        main()

if __name__ == '__main__':
    main()