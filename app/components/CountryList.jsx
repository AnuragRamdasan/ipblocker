import React from 'react';
import { Card, ResourceList, TextStyle, Button, Modal, TextContainer } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';

export function CountryList({ countries }) {
  const fetcher = useFetcher();
  const [active, setActive] = React.useState(false);
  const [countryToDelete, setCountryToDelete] = React.useState(null);

  const handleDelete = (countryId) => {
    setCountryToDelete(countryId);
    setActive(true);
  };

  const handleConfirmDelete = () => {
    fetcher.submit({ countryId: countryToDelete, _action: 'delete' }, { method: 'post' });
    setActive(false);
  };

  return (
    <Card>
      <ResourceList
        resourceName={{ singular: 'country', plural: 'countries' }}
        items={countries}
        renderItem={(item) => {
          return (
            <ResourceList.Item id={item.id}>
              <TextStyle variation="strong">{item.name}</TextStyle> ({item.code})
              <Button onClick={() => handleDelete(item.id)} destructive>X</Button>
            </ResourceList.Item>
          );
        }}
      />
      <Modal
        open={active}
        onClose={() => setActive(false)}
        title="Delete Country"
        primaryAction={{
          content: 'Delete',
          onAction: handleConfirmDelete,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setActive(false),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>Are you sure you want to delete this country?</p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Card>
  );
}