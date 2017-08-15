import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardHeader } from 'material-ui/Card';
// menus and toolbars etc.
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
// buttons
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
// icons
import ActionEject from 'material-ui/svg-icons/action/eject';
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle';
import ActionFace from 'material-ui/svg-icons/action/face';
import DeviceDeveloperMode from 'material-ui/svg-icons/device/developer-mode';

function AppDrawer(props) {
  return (
    <Drawer open={ props.open } docked={ false } onRequestChange={ props.changeOpenState }>
      <AppBar title="Menu" showMenuIconButton={ false }/>
      <Card style={ { margin: 12, width: '90%', paddingBottom: 12 } }>
        <CardHeader title="Projects"/>
        <div style={ {width:'90%', margin: 'auto'} }>
          <Link to='/projects'>
            <RaisedButton label="Find Projects" fullWidth={ true } primary={ true } onClick={ props.closeDrawer } icon={ <DeviceDeveloperMode/> }/>
          </Link>
          <RaisedButton label="My Projects" fullWidth={ true } onClick={ props.closeDrawer }/>
          </div>
        </Card>
      <Card style={ { margin: 12, width: '90%', paddingBottom: 12 } }>
        <CardHeader title="Users"/>
        <div style={ {width:'90%', margin: 'auto'} }>
          <RaisedButton label="Find A Partner" fullWidth={ true } secondary={ true } onClick={ props.closeDrawer } icon={ <ActionFace/> }/>
          <RaisedButton label="My Partners" fullWidth={ true } onClick={ props.closeDrawer }/>
          </div>
        </Card>
      <BottomNavigation style={ { position: "absolute", bottom: 0 } }>
        <BottomNavigationItem label="Sign Out" icon={ <ActionEject/> }/>
        <Link to='/user'><BottomNavigationItem label="My Account" icon={ <ActionAccountCircle/> }/></Link>
      </BottomNavigation>
    </Drawer>
  )
}

export default AppDrawer;
