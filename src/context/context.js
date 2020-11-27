import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com'; 

const GithubContext = React.createContext()
const GithubProvider = ({children}) => {
    const [ githubUser, setGithubUser] =  useState(mockUser)
    const [ repos, setRepos] =  useState(mockRepos)
    const [followers, setFollowers] =  useState(mockFollowers)
    //request loading
    const [ request, setRequest ] = useState(0)
    const [ loading, setLoading ] = useState(false)
    //error
    const [error, setError] = useState({show: false, msg:''})
    const searchGithubUser = async(user) => {
        toggleError()
        setLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`).catch(err => console.error(err))
        if(response){
            setGithubUser(response.data)
            const { login, followers_url } = response.data
            axios(`${rootUrl}/users/${login}/repos?per_page=100`)
            .then(response => {
                setRepos(response.data)
            })
            axios(`${followers_url}?per_page=100`)
            .then(response => {
                setFollowers(response.data)
            })
            // https://api.github.com/users/Sedki-Sghairi/followers
            // https://api.github.com/users/Sedki-Sghairi/repos

        }else{
            toggleError(true,'no github user with this name.')
        }
        checkRequests()
        setLoading(false)
    }
    //check rate
    const checkRequests = () => {
        axios(`${rootUrl}/rate_limit`)
        .then(({data}) => {
            let {rate: {remaining}} = data
            setRequest(remaining)
            if(remaining === 0){
                toggleError(true,
            'sorry, you have exeeded you per-hour requests limit. Please try again in an hour.')
            }
            })
        .catch((err) => console.error(err))
    }
    function toggleError(show = false ,msg = ''){
        setError({show,msg})
    }
    useEffect(checkRequests, [])
    return(
        <GithubContext.Provider value={
            {
                githubUser,
                repos,
                followers ,
                request,
                error,
                searchGithubUser,
                loading
                      }
                      }>
        {children}
        </GithubContext.Provider>
    )
}

export { GithubProvider, GithubContext }