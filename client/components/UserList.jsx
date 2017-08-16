import React from 'react';
import { Link } from 'react-router-dom';

import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';

const UserList = (props) => {
  return (
    <List>
      <Subheader>Users interested in this project</Subheader>
      { props.users.map((user, index) => {
        return (
          <ListItem
            containerElement={
              <Link to={ `/user/${ user.id }` }/> }
              leftAvatar={
                <Avatar src="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAAyLAAAAJDQ4YzMwZTNlLTAwODItNGYwMC1iMGQxLWYzOGZiZjM5YWE3NQ.jpg"/>
              }
            key={ index }
            primaryText={ user.name }
            secondaryText={ "Rating: " + user.rating }
          />
        );
      },
      )}
    </List>
  );
};

export default UserList;
