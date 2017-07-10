import * as request from 'request'
import * as requestPromise from 'request-promise'


export type RequestAPI = request.RequestAPI<
  requestPromise.RequestPromise,
  requestPromise.RequestPromiseOptions, request.RequiredUriUrl>;


export type RequestOption = (
  request.UriOptions & requestPromise.RequestPromiseOptions);
