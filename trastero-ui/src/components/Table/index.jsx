import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Chip from '@material-ui/core/Chip';
import { lighten } from '@material-ui/core/styles/colorManipulator';


function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}


const COLLECTIONS_QUERY = gql`
  query Query {
    collections
  }
`


class Collections extends React.Component {

  render() {
    const {classes, collection, setCollection} = this.props;

    return (
      <Query query={COLLECTIONS_QUERY}>
        {({loading, error, data: rawData}) => {
          if (loading) {
            return <LinearProgress/>;
          }

          if (error) {
            return <p>Error :(</p>;
          }

          const collections = rawData.collections;

          return (
            <TextField
              id='select-collection'
              select
              placeholder='Select a collection'
              className={classes.textField}
              value={collection}
              onChange={setCollection}
              SelectProps={{
                MenuProps: {
                  className: classes.menu,
                },
              }}
              helperText={collection ? undefined : 'Please select a collection'}
              margin="normal"
            >
              {collections.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          )
        }}
      </Query>
    )
  }
}


Collections.propTypes = {
  classes: PropTypes.object.isRequired,
  setCollection: PropTypes.func.isRequired,
};


const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});


class TableToolbar extends React.Component {

  render() {
    const { numSelected, classes, collection, setCollection } = this.props;

    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        <div className={classes.title}>
          {numSelected > 0 ? (
            <Typography color="inherit" variant="subheading">
              {numSelected} selected
            </Typography>
          ) : (
            <Collections
              classes={classes}
              collection={collection}
              setCollection={setCollection}
            />
          )}
        </div>
        <div className={classes.spacer}/>
        <div className={classes.actions}>
          {numSelected &&
              <Tooltip title="Delete">
                <IconButton aria-label="Delete">
                  <DeleteIcon/>
                </IconButton>
              </Tooltip>
          }
        </div>
      </Toolbar>
    )
  }
}


TableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};


TableToolbar = withStyles(toolbarStyles)(TableToolbar);


class TableHeaders extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, columns } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {columns.map(column => {
            return (
              <TableCell
                key={column}
                //numeric={column.numeric}
                //padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column ? order : false}
              >
                <Tooltip
                  title="Sort"
                  //placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column}
                    direction={order}
                    onClick={this.createSortHandler(column)}
                  >
                    {column}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}


TableHeaders.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
};


/**
 * Table data query.
 *
 * NOTE: The `id` field is required and used within the child component identifiers.
 *       The `collection` variable must be provided and has special usage on the backend.
 */
const TableData = {};
TableData.fragments = {
  Fields: gql`
    fragment Fields on Item {
      id
      thumbnail
      url
      tags
      metadata
    }
  `,
}

TableData.query = gql`
  query Query($collection: String, $limit: Int) {
    collection(name: $collection)
    items(first: $limit) {
      pageInfo {
        startCursor
        endCursor
      }
      edges {
        node {
          ...Fields
        }
      }
    }
  }
  ${TableData.fragments.Fields}
`


const COLUMNS = [
  // 'thumbnail',
  'url',
  'tags',
  // 'metadata',
  // 'metadata.type',
];


class QueryTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      columns: COLUMNS,
      collection: '',
      order: 'asc',
      orderBy: 'url',
      selected: [],
      page: 0,
      rowsPerPage: 10,
      limit: 100000,
    }
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = (event, checked, data) => {
    if (checked) {
      this.setState(state => ({ selected: data.map(n => n.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  setCollection = event => {
    this.setState({
      collection: event.target.value,
      selected: [],
      page: 0,
    });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  deleteChip = (item, label) => {
    // TODO:
    alert('You clicked delete for ' + label + ' on ' + item.url)
  };

  normalizeData(rawData) {
    return rawData.items.edges.map(edge => {
      const item = {id: edge.node.id};
      for (let key of this.state.columns) {
        let value = edge.node;
        for (let part of key.split('.')) {
          if (part === 'metadata') {
            value = JSON.parse(value[part]);
          } else {
            value = value[part];
          }
        }
        item[key] = value;
      }
      return item;
    })
  };

  render() {

    const { classes } = this.props;
    const { columns, order, orderBy, selected, rowsPerPage, page, limit, collection } = this.state;

    // FIXME: Figure out how to do infinite scroll
    return (
      <Paper className={classes.root}>
        <TableToolbar
          numSelected={selected.length}
          collection={collection}
          setCollection={(e) => this.setCollection(e)}
        />
        {collection &&
          <Query
            query={TableData.query}
            variables={{collection: collection, limit: limit}}
            fetchPolicy='network-only'
          >
            {({loading, error, data: rawData}) => {
              if (loading) {
                return <LinearProgress/>;
              }

              if (error) {
                return <p>Error :(</p>;
              }

              const data = this.normalizeData(rawData);

              return (
                <div className={classes.tableWrapper}>
                  <Table className={classes.table} aria-labelledby="tableTitle">
                    <TableHeaders
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={(e, checked) => this.handleSelectAllClick(e, checked, data)}
                      onRequestSort={this.handleRequestSort}
                      rowCount={data.length}
                      columns={columns}
                    />
                    <TableBody>
                      {data
                        .sort(getSorting(order, orderBy))
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map(item => {
                          const isSelected = this.isSelected(item.id);
                          return (
                            <TableRow
                              hover
                              onClick={event => this.handleClick(event, item.id)}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={-1}
                              key={item.id}
                              selected={isSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox checked={isSelected}/>
                              </TableCell>

                              {columns.map(column => {

                                const cellData = item[column];


                                // If the value is an array render it as a series of
                                // Chip components.
                                if (Array.isArray(cellData)) {
                                  return (
                                    <TableCell key={item.id + '_' + column}>
                                      {cellData.map((x) => (
                                        <Chip
                                          key={item.id + '_' + column + '_' + x}
                                          label={x}
                                          onDelete={() => this.deleteChip(item, x)}
                                        />
                                      ))}
                                    </TableCell>
                                  )
                                  // If the value is an object, json serialize it so we
                                  // can render it in a TableCell
                                } else if (cellData === Object(cellData)) {
                                  return (
                                    <TableCell key={item.id + '_' + column}>
                                      {JSON.stringify(cellData)}
                                    </TableCell>
                                  )
                                } else {
                                  return (
                                    <TableCell key={item.id + '_' + column}>
                                      {cellData}
                                    </TableCell>
                                  )
                                }
                              })}
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                      'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </div>
              )
            }}
          </Query>
        }
      </Paper>
    )
  }
}


QueryTable.propTypes = {
  classes: PropTypes.object.isRequired,
};


const styles = theme => ({
  root: {
    width: '100%',
    // marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});


export default withStyles(styles)(QueryTable)
