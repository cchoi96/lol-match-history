import React, { Component } from 'react';
import './SearchResults.css';

class SearchResults extends Component {
    constructor () {
        super();
        this.state = {
            accountid : '',
            matchlist : '',
            matches : [],
            summonername : ''
        };
    }

    getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
      
    searchHandler = (search) => {
        this.setState({ summonername: search.target.value })
    }

    async matchlistHandler () {
        if (this.state.matchlist.length > 0) {
          for (var i = 0; i < this.state.matchlist.length; i++) {
            const response = await fetch(
                `/api/summoner/match/?accountid=${this.state.accountid}&matchid=${this.state.matchlist[i]}`
            );
            const json = await response.json();
            var arrayDuplicate = this.state.matches.slice();
            arrayDuplicate[i] = json;
            this.setState({matches: arrayDuplicate});
          }        
        }
    }

    async matchesHandler () {
        if (this.state.accountid !== '') {
            const response = await fetch(
                `/api/summoner/matchlist/?accountid=${this.state.accountid}`
            );
            if (response !== 0) {
              const json = await response.json();
              this.setState({matchlist: json}, 
                this.matchlistHandler);
            }
        }
    }

    async accountIdHandler () {
        if (this.state.summonername !== '') {
            const response = await fetch(
                `/api/summoner/info/?summonername=${this.state.summonername}`
            );
            if (response !== 0) {
              const json = await response.json();
              this.setState({ accountid: json }, 
                this.matchesHandler);
            }   
        }
    }

    async componentDidMount() {
        if (this.getParameterByName('summonername') !== null) {
          this.setState({ summonername: this.getParameterByName('summonername')}, 
            this.accountIdHandler);
        }
    }

    render () {
        const currentPatch = '8.14';
        
        return (
            <div className='responsiveTable'>
                <form onSubmit={this.searchHandler}>
                    <input id='summonername' name='summonername' type='text' placeholder='Summoner Name!'/>        
                    <button>Search</button>
                </form>

                <h4>{this.state.summonername.toUpperCase()}{this.state.accountid !== 0 ? '' : ' Not Found'}</h4>

                <table>
                    <thead>
                        <tr className='headers'>
                            <th>STATUS</th>
                            <th>CHAMPION</th>
                            <th>SUMMONERS</th>
                            <th>DURATION</th>
                            <th>KDA</th>
                            <th>LEVEL</th>
                            <th>CS</th>
                            <th>CSPM</th>
                        </tr>
                    </thead>
                    <tbody className='body'>
                        {this.state.matches.map(match => 
                                <tr className={match.win === true ? 'won data' : 'lost data'}>
                                    <td>{match.win == true ? 'WON' : 'LOST'}</td>
                                    <td><img src={`http://ddragon.leagueoflegends.com/cdn/${currentPatch}.1/img/champion/${match.champion}`} width='80px'/></td>
                                    <td>
                                        <img src={`/assets/summoners/${match.spells[0]}`} width='50px'/>
                                        <img src={`/assets/summoners/${match.spells[1]}`} width ='50px'/>
                                    </td>
                                    <td>{match.duration}</td>
                                    <td>{match.kda}</td>
                                    <td>{match.level}</td>
                                    <td>{match.cs}</td>
                                    <td>{match.cspm}</td>
                                </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default SearchResults;