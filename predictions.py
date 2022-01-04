#%%[markdown]
# #Predicting Inventory Sales
# ##Import Libraries

#%%
import warnings;
warnings.simplefilter('ignore');
#%%
# ##Install Dependencies
import pandas as pd; #dataframe library
import matplotlib.pyplot as plt; #data plot library
import numpy as np; #library for object support
from fbprophet import Prophet; #open-source Prophet library

#%%
# ##Read and Process Data
df = pd.read_csv() #reas csv data file
df.head() #view the csv data file read
df.describe() #describes the data read from the csv file

#Determines if columns in csv data file are unique
print(df('column name').unique())

#Clean Data
df['ds'] = pd.DatetimeIndex(df['Date'])

#%%
# ##Train Model
m = Prophet(interval_with=0.95, daily_seasonality=True)
model = m.fit(df)

#%%
# ##Data Forecasting
future = m.make_future_dataframe(periods=365, freq='D') #predict 365 days in future
forecast = m.predict(future)
forecast.head() #yhat == prediction for first 5 rows
forecast.tail() #yhat == prediction for last 5 rows (future periods)

plot1 = m.plot(forecast) #see a plot of forecast model by ds

plot2 = m.plot_components(forecast) #see plot of forecast broken down
