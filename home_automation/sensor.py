# This is a script to read a temp sensor, control an led, and enter the results into a database
import Adafruit_DHT
import time
import RPi.GPIO as GPIO
import mariadb
import datetime
from pytz import timezone

temperature='z'
humidity='z'

x=datetime.datetime.now(timezone('America/Chicago'))
stamp = x.strftime("%x %X")

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
""" pi pins are:
    4 for DHT
    17 for Red, 27 for Green, 22 for Blue"""
GPIO.setup(17, GPIO.OUT)
GPIO.setup(27, GPIO.OUT)
GPIO.setup(22, GPIO.OUT)

def LED_RGB(red, green, blue):
    if red == 1:
       GPIO.output(17, GPIO.HIGH)
    elif red == 0:
       GPIO.output(17, GPIO.LOW)

    if green == 1:
       GPIO.output(27, GPIO.HIGH)
    elif green == 0:
       GPIO.output(27, GPIO.LOW)

    if blue == 1:
       GPIO.output(22, GPIO.HIGH)
    elif blue == 0:
       GPIO.output(22, GPIO.LOW)
    return

def LED_color(temp):
    if temp > 26:
       LED_RGB(1,0,0)
    elif temp >= 24:
       LED_RGB(0,1,0)
    elif temp >= 21:
       LED_RGB(1,1,0)
    elif temp < 21:
       LED_RGB(0,0,1)

def temp_grab():
    DHT_SENSOR = Adafruit_DHT.DHT11
    DHT_PIN = 4
    humidity, temperature = Adafruit_DHT.read(DHT_SENSOR, DHT_PIN)
    return temperature, humidity

def temp_set(temperature, humidity):
    if humidity is not None and temperature is not None:
#        print(temperature, humidity, sep=',')
        LED_color(temperature)
#        LED_RGB(0,0,0)
    else:
        LED_RGB(0,0,0)
        time.sleep(3)


def sql_update(temp, hum):
    mydb = mariadb.connect(
        host='localhost',
        user='raccoon',
        password='',
        database='home'
    )
    mycursor = mydb.cursor()

    sql = "INSERT INTO sensor (temp, humidity, Time) VALUES (%s, %s, %s)"
    val = (temp, hum, stamp)
    mycursor.execute(sql, val)

    mydb.commit()

def main():
    temperature, humidity = temp_grab()
#    print(temperature, humidity, sep='|')
    temp_set(temperature, humidity)
    try:
        int(temperature)
        sql_update(temperature, humidity)
    except:
#        print('Exits successful')
        main()

if __name__ == '__main__':
    main()