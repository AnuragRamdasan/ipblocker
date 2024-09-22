import {
  Page,
  Layout,
  Tabs,
  Checkbox,
  Card,
  Button,
  Text,
  Banner,
  List,
  Form,
  Link,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonTabs,
} from "@shopify/polaris";

const IndexSkeleton = () => {
  return (
    <SkeletonPage>
      {" "}
      <Layout>
        <Layout.Section>
          <SkeletonTabs count={4} />
          <Card>
            <SkeletonDisplayText />
            <br />
            <SkeletonBodyText />
            <br />
            <SkeletonDisplayText />
            <br />
            <SkeletonBodyText />
            <br />
            <SkeletonDisplayText />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned>
            <Text>
              <SkeletonBodyText />
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
};

export default IndexSkeleton;
