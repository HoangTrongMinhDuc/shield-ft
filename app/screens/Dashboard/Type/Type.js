/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { Table, Button, Icon, PageHeader, message, Popconfirm } from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';
import TypeForm from '../../../components/TypeForm';
import { isEmpty } from 'lodash';
import ErrNoti from '../../../utils/ErrorNotification';
import moment from 'moment';
import PropsType from 'prop-types';

const getColumns = actions => [
  {
    title: '#',
    key: '#',
    dataIndex: 'key',
    render: cell => <b key={cell}>{cell}</b>,
    width: 40
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 140,
    render: text => <a>{text}</a>
  },
  {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    render: text => <>{text}</>
  },
  {
    title: 'Update at',
    key: 'update',
    dataIndex: 'updatedDate',
    width: 150,
    render: text => <>{moment(text, moment.ISO_8601).fromNow()}</>
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (cell, row) => (
      <ButtonGroup>
        <Button onClick={e => actions.edit(row)} type="primary" icon="edit" />
        <Popconfirm
          title="Are you sure delete this?"
          onConfirm={() => actions.delete(row)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="danger" icon="delete" />
        </Popconfirm>
      </ButtonGroup>
    ),
    width: 100,
    align: 'center'
  }
];

const Type = props => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const API = props.api;

  useEffect(() => {
    document.title = `${props.description} - Dashboard - Shield Manga`;
  });

  useEffect(() => {
    setLoading(true);
    API.list()
      .then(res => {
        setData(res.data.map((v, i) => ({ ...v, key: i + 1 })));
      })
      .catch(ErrNoti)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (document.location.href.includes('#add')) setVisible(true);
  }, [document.location.href]);

  const close = () => {
    setVisible(false);
    setFormData({});
  };

  const receiveData = resData => {
    if (isEmpty(formData)) createType(resData);
    else updateType(resData);
  };

  const createType = formData => {
    const load = message.loading(`Creating ${formData.name}`, 0);
    API.create({ ...formData })
      .then(res => {
        setData([...data, { ...res.data, key: data.length + 1 }]);
        load();
        message.success(`Created ${formData.name}`);
      })
      .catch(ErrNoti)
      .finally(load);
  };

  const editType = type => {
    setFormData(type);
    setVisible(true);
  };

  const updateType = ({ ...formData }) => {
    const load = message.loading(`Updating ${formData.name}`, 0);
    setFormData({});
    API.update(formData)
      .then(res => {
        setData(
          data.map((value, i) => {
            if (value._id === formData._id) {
              return { ...res.data, key: i + 1 };
            }
            return value;
          })
        );
        message.success(`Updated ${formData.name}`);
      })
      .catch(ErrNoti)
      .finally(load);
  };

  const deleteType = type => {
    const load = message.loading(`Deleting ${type.name}`, 0);
    API.delete(type._id)
      .then(res => {
        setData(data.filter(c => c._id !== type._id));
        message.success(`Deleted ${type.name}`);
      })
      .catch(ErrNoti)
      .finally(load);
  };

  return (
    <>
      <PageHeader
        onBack={() => props.history.goBack()}
        title={props.name}
        subTitle={props.description}
      />
      <Table
        columns={getColumns({ edit: editType, delete: deleteType })}
        dataSource={data}
        bordered
        rowKey="uid"
        loading={loading}
        title={() => (
          <Button
            type="dashed"
            block
            disabled={loading}
            onClick={() => setVisible(true)}
          >
            <Icon type="plus" />
            Create
          </Button>
        )}
      />
      <TypeForm
        visible={visible}
        close={close}
        callback={receiveData}
        formData={formData}
      />
    </>
  );
};

Type.propTypes = {
  props: PropsType.object,
  history: PropsType.object,
  name: PropsType.string.isRequired,
  description: PropsType.string.isRequired,
  api: PropsType.object
};

export default Type;
