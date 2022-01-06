#%%[markdown]
# #Predicting Inventory Sales
# ##Import Libraries

#%%
import warnings;
warnings.simplefilter('ignore');
#%%
# ##Install Dependencies
import pickle
import pandas as pd; #dataframe library
from matplotlib import pyplot as plt; #library for plotting
import numpy as np; #library for object support
from fbprophet import Prophet; #open-source Prophet library

#%%
# ##Read and Process Data
path='https://raw.githubusercontent.com/jbrownlee/Datasets/master/monthly-car-sales.csv'
df = pd.read_csv(path, header=0) #reas csv data file
df.head() #view the csv data file read
df.describe() #describes the data read from the csv file

#Determines if columns in csv data file are unique
#print(df('column name').unique())

#Clean Data
#df['ds'] = pd.DatetimeIndex(df['Date'])

# Prepare Column Names -- Must be named ds and y for FBProphet to work!
df.columns = ['ds', 'y']
df['ds']= pd.to_datetime(df['ds'])
#%%
# ##Train Model
model = Prophet(daily_seasonality=True)
model.fit(df)

#%%
# ##Data Forecasting
future = model.make_future_dataframe(periods=15, freq='D') #predict 365 days in future
forecast = model.predict(future)
forecast.head() #yhat == prediction for first 5 rows
forecast.tail() #yhat == prediction for last 5 rows (future periods)

plot1 = model.plot(forecast) #see a plot of forecast model by ds

plot2 = model.plot_components(forecast) #see plot of forecast broken down

# %%
# ## Saves the Model
with open('forecast_model.pckl', 'wb') as fout:
    pickle.dump(model, fout)

# %%
