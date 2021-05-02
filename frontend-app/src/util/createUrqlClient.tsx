import { createClient, dedupExchange, fetchExchange } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql"
import { QueryInput,Cache,cacheExchange, Resolver } from '@urql/exchange-graphcache'
import {pipe, tap } from 'wonka';
import { Exchange } from 'urql';
 import Router from 'next/router'
 import { stringifyVariables } from '@urql/core';


function typedUpdatedQuery<Result,Query>(

    cache:Cache,
    qi:QueryInput,
    result:any,
    fn:(r:Result,q:Query) => Query
  
    )
    
  {
    return cache.updateQuery(qi,data => fn(result,data as any) as any)
  }






export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('user not Authenticated')) {
        Router.replace('/login')
      }
    })
  );
};





// cursor pagination

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = ({
}: PaginationParams = {}):Resolver => {
 

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const result:string[] = []

    const  fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(entityKey,fieldKey)
    info.partial = !isItInTheCache
    fieldInfos.forEach(fi =>{

      const data = cache.resolve(entityKey,fi.fieldKey) as string[]
      result.push(...data)
    })

    return result


    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};




export const CreateUrqlClient = (ssrExchange:any) => ({

        url: 'http://localhost:3333/graphql',
        fetchOptions:{
          credentials:"include" as const
        },
        exchanges: [dedupExchange, cacheExchange({
          resolvers:{
            Query:{
              posts:cursorPagination()
            }
          },
          updates:{
            Mutation:{
              logout:(_result,args,cache,info) =>{
                typedUpdatedQuery<LogoutMutation, MeQuery>(cache,{query:MeDocument},_result,() => ({me:null}))
              },
              login:(_result,args,cache,info) =>{
                typedUpdatedQuery<LoginMutation,MeQuery>(cache,
                  {query:MeDocument},
                    _result,
                    (result,query) =>{
                      if(result.login.errors){
                        return query
                      }else{
                        return{
                          me: result.login.user
                        }
                      }
                    })
              },
              register:(_result,args,cache,info) =>{
                typedUpdatedQuery<RegisterMutation,MeQuery>(cache,
                  {query:MeDocument},
                    _result,
                    (result,query) =>{
                      if(result.register.errors){
                        return query
                      }else{
                        return{
                          me: result.register.user
                        }
                      }
                    })
              } 
            }
          }
        }),
        errorExchange,
        ssrExchange,
        fetchExchange],
      })


