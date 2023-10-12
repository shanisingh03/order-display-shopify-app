import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Link,
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Badge,
  EmptyState
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query {
      orders(first: 50) {
      edges {
        node {
          id
          name
          note
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
            }
          }
        }
      }
    }
    }
    `,
  );

  const responseJson = await response.json();
  return json({
    orders: responseJson.data.orders.edges,
  });
};


const EmptyOrderCodeState = () => (
  <EmptyState
    heading="Store Orders."
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>No Orders Found on Store, Please create order first.</p>
  </EmptyState>
);

const OrderTable = ({ orders }) => (
  <IndexTable
    resourceName={{
      singular: "Order",
      plural: "Orders",
    }}
    itemCount={orders.length}
    headings={[
      { title: "Name" },
      { title: "Payment Status" },
      { title: "Total Amount" },
      { title: "Created At" },
    ]}
    selectable={false}
  >
    {orders.map((order) => (
      <OrderTableRow key={order['node'].id} order={order['node']} />
    ))}
  </IndexTable>
);

const OrderTableRow = ({order }) => (
  <IndexTable.Row key={order.id} id={order.id} position={order.id}>
    <IndexTable.Cell>
      {order.name}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.displayFinancialStatus}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.totalPriceSet.shopMoney.amount}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.note}
    </IndexTable.Cell>
    <IndexTable.Cell>
    {new Date(order.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);



export default function Index() {
  const nav = useNavigation();
  const { orders } = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {/* <pre>{JSON.stringify(orders,)}</pre> */}
              {orders.length === 0 ? (
                <EmptyOrderCodeState />
              ) : (
                <OrderTable orders={orders} />
              )}
            </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
