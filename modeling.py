#%%[markdown]
# #Predicting Inventory

#%%
# ##Ignore Warnings
import warnings;
warnings.simplefilter('ignore');

#%%
# ##Import Libraries
import pandas as pd
import numpy as np

#%%
# ##Read Data
df=pd.read_csv('SampleDiagnosticTestOrders.csv',index_col="Date",parse_dates=True)
df.head()
df.index = pd.to_datetime(df.index)

#%%
# ## Plot General Data
#This will show the overall total amount of diagnostic lab tests ordered (not specific)
total_orders = df.plot(title='Diagnostic Lab Orders', figsize=(15,6))
total_orders.set(xlabel="Order Date", ylabel="Order Quantity")

#%%
# ## Plot Specific Data
#This will show the specific amount of aerobic cultures orderes by date
aerobic = df['Aerobic Culture Orders']
aerobic_orders_plot = aerobic.plot(title='Aerobic Culture Orders', figsize=(15,6))
aerobic_orders_plot.set(xlabel="Order Date", ylabel="Order Quantity")

#%%
# ## Determine Order for ARIMA Model
from pmdarima import auto_arima
stepwise_fit = auto_arima(aerobic, start_p=1, start_q=1, max_p=3, max_q=3, m=12, start_P=0, d=1, D=1, trace=True, error_action='ignore', seasonal=True, suppress_warnings=True)
stepwise_fit.summary()

#%%
# ## Split Data into Training and Testing Data Sets
print(aerobic.shape)
train=aerobic.loc['2019-01-01':'2021-12-31']
test=aerobic.loc['2021-12-01':'2021-12-31']
print("Training Data", train)
print("Testing Data", test)

#%%
# ## Train the Model
trained_model = stepwise_fit.fit(train)
trained_model.summary()

#%%
# ## Test the Model
future_forecast = trained_model.predict(n_periods=31)
future_forecast = pd.DataFrame(future_forecast,index = test.index, columns=["Prediction"])
pd.concat([test,future_forecast],axis=1).plot()

#%%
# ## Determine Mean Squared Error of Trained Model for Accuracy
from sklearn.metrics import mean_squared_error
from math import sqrt
rmse=sqrt(mean_squared_error(future_forecast,test))
print(rmse)

#%%
# ## Making a Future Prediction Using Trained Model
trained_prediction_model = trained_model.fit(aerobic)
trained_prediction_model.summary()
index_future_dates=pd.date_range(start='2022-01-01',end='2022-01-31')
prediction = trained_prediction_model.predict(n_periods=31)
prediction = pd.DataFrame(prediction, index=index_future_dates, columns=['Order Predictions'])
prediction_plot = pd.concat([aerobic, prediction], axis=1).plot(title='Predicted Orders', figsize=(15,6))
prediction_plot.set(xlabel="Order Date", ylabel="Order Quantity")

# %%
# ## Save the ARIMA Model for Future Use
import pickle
with open('saved_model.pkl', 'wb') as file:
    pickle.dump(trained_prediction_model, file)
# %%
