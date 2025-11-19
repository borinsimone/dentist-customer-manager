import type { ReactNode } from "react";
import { Layout } from "../layout/Layout";
import { Card, CardBody } from "../common/Card";

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
  actions?: ReactNode;
}

export const Placeholder = ({
  title,
  icon,
  description,
  actions,
}: PlaceholderProps) => {
  return (
    <Layout title={title} actions={actions}>
      <Card>
        <CardBody>
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "1rem",
              }}
            >
              {icon}
            </div>
            <h2>{title}</h2>
            <p
              style={{
                color: "#64748b",
                marginTop: "1rem",
              }}
            >
              {description}
            </p>
          </div>
        </CardBody>
      </Card>
    </Layout>
  );
};
