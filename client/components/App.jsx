/*
  This is the main (parent) component for the application.

  Inside the App state component we are 3 ajax calls to the server
    1. getting the list of projects from the database
    2. getting the message from the database
    3. checking authentication

  You can find these routes inside server/routes/index.js

 */

import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import ActionHome from 'material-ui/svg-icons/action/home';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { fullWhite } from 'material-ui/styles/colors';
import SocialPartyMode from 'material-ui/svg-icons/social/party-mode';

import AppDrawer from './AppDrawer';
import Landing from './Landing';
import UserProfile from './UserProfile';
import UserDetails from './UserDetails';
import Project from './Project';
import ProjectStatus from './ProjectStatus';
import ProjectList from './ProjectList';
import Questionnaire from './Questionnaire';
import NotFound from './NotFound';
import MyProjects from './MyProjects';
import MyPartners from './MyPartners';


class App extends React.Component {
  constructor(props) {
    super(props);
    //console.log('App.jsx PROPS', props);
    //console.log(this);
    this.state = {
      loggedIn: false,
      drawerOpen: false,
      partyMode: false,
    }
    this.checkAuthenticated();

    this.navTap = this.navTap.bind(this);
    this.togglePartyMode = this.togglePartyMode.bind(this);
  }

  //gets list of projects
  getProjects() {
    axios.get('/API/projects/')
      .then((project) => {
        this.props.addProjectsList(project.data);
      })
      .catch(console.error);
  }

  //gets messages
  getMessages() {
    axios.get('/API/messages')
      .then((res) => {
        this.props.loadMessages(res.data)
      })
      .catch(console.error);
  }

  navTap() {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  }

  //gets authentication
  checkAuthenticated() {
    console.log("am i running??????")
    axios.get('/auth/authenticated')
      .then((res) => {
        console.log('SETTInG the STATE', this);

        //console.log('AUTH get Messages');
        this.setState({ loggedIn: res.data });
        this.getMessages();

        //console.log('AUTH get Projects');
        this.getProjects();
      });
  }

  //party mode
  togglePartyMode() {
    const colors = ['blue', 'green', 'red', 'yellow', 'lilac'];
    if (this.state.partyMode) {
      clearInterval(this.state.partyMode);
      document.body.setAttribute('style', `background-color:white`);
      this.setState({ partyMode: false });
    } else {
      this.setState({partyMode:
        setInterval(() => {
          const randomNum = Math.floor(Math.random() * colors.length);
          document.body.setAttribute('style', `background-color:${colors[randomNum]}`);
        }, 200),
      });
    }
  }

  render() {
    //console.log('App render this: ', this);
    /*
     Condition:
     If user is registered and logs render all the components.
     If user is new and logged in using github auth, render questionnaire
     If user is not logged in (logged out) display landing page
    */
    if (this.state.loggedIn.language) {
      console.log('App rendering', this.state.loggedIn);
      return (
        <BrowserRouter>
          <div>
            <AppBar title='GitPal' onLeftIconButtonTouchTap={ this.navTap } iconElementRight={ <Link to='/'><IconButton><ActionHome color={ fullWhite }/></IconButton></Link> }/>

            {/* opens and closes side menu */}
            <AppDrawer open={ this.state.drawerOpen } changeOpenState={ open => this.setState({ drawerOpen: open }) } closeDrawer={ () => this.setState({ drawerOpen: false}) }/>

            {/*
              Switch renders a route exclusively. Without it, it would route inclusively
              LINK: https://reacttraining.com/react-router/web/api/Switch
            */}
            <Switch>
              <Route exact path="/" component={ProjectList} />
              <Route path="/signup" component={Questionnaire} />
              <Route exact path="/projects" component={ProjectList} />
              <Route path="/projects/:id" component={Project} />
              <Route path="/status" component={ProjectStatus} />
              <Route path="/my-projects" component={MyProjects} />
              <Route path="/my-partners" component={MyPartners} />

              {/*
                given this path render this component and pass down the loggedIn state as user props
              */}
              <Route exact path='/user'
                render={() => (<UserProfile user={this.state.loggedIn} />) } />

              <Route path="/user/:id/:projectId?" component={UserDetails} />
              <Route path="/user/:id" component={UserDetails} />
              <Route component={NotFound} />
            </Switch>
            <FloatingActionButton secondary={ true } style={ { position: "absolute", bottom: 20, left: 20 } } onClick={ this.togglePartyMode } >
              <SocialPartyMode />
            </FloatingActionButton >
          </div>
        </BrowserRouter>
      );
    } else if (this.state.loggedIn) {
      return <Questionnaire user={this.state.loggedIn} />;
    } else {
      console.log('LOGGING ON', this.state);
          return <Landing checkAuth={ this.checkAuthenticated } />;
    }
  }
}

/*
  Allows App component to have message and project state
*/
const mapStateToProps = (state) => {
  //console.log('APP state: ', state);
  return {
    message: state.message,
    projects: state.projects,
  };
};

/*
  Map our dispatch to App component as props
  Dispatch can be found in store/reducers.js
*/
const mapDispatchToProps = (dispatch) => {
  //console.log('APP dispatch: ', dispatch);
  return {
    changeString: () => dispatch({
      type: 'CHANGE_STRING',
      text: 'some other message'
    }),
    addProjectsList: projects => dispatch({
      type: 'LIST_PROJECTS',
      projects,
    }),
    loadMessages: messages => dispatch({
      type: 'MESSAGES_LOAD',
      messages,
    }),
  };
};

//connects the Store to App component
export default connect(mapStateToProps, mapDispatchToProps)(App);
