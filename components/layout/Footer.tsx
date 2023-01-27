import { useMemo } from "react";
import { useRouter } from "next/router";
import type { TFunction } from "next-i18next";
import { useTranslation } from "next-i18next";
import { Link } from "@components/common/Link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import routes from "routes";
import type { SupportedLocale } from "types/next-i18next";

import { Copyright } from "./Copyright";

type FooterSection = {
  title: string;
  links: {
    title: string;
    url: string;
  }[];
};

const getFooterData: (
  t: TFunction,
  locale: SupportedLocale
) => FooterSection[] = (t, locale) => [
  {
    title: t("footer.about"),
    links: [
      { title: t("footer.introduction"), url: routes.introduction[locale] },
      { title: t("footer.history"), url: "/history" },
      { title: t("footer.guidelines"), url: "/guidelines" },
      { title: t("footer.contact"), url: "/contact" },
    ],
  },
  {
    title: t("footer.community"),
    links: [
      { title: t("footer.institutions"), url: "/institutions" },
      { title: t("footer.people"), url: "/people" },
      { title: t("footer.news"), url: "/news" },
    ],
  },
  {
    title: t("footer.activities"),
    links: [
      { title: t("footer.publications"), url: "/publications" },
      { title: t("footer.events"), url: "/events" },
      { title: t("footer.projects"), url: "/projects" },
      { title: t("footer.presentations"), url: "/presentations" },
    ],
  },
];

export const Footer = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = router.locale as SupportedLocale;

  const footerData = useMemo(() => getFooterData(t, locale), [t, locale]);

  return (
    <Container
      maxWidth="md"
      component="footer"
      sx={{
        py: [4, 6],
        justifyContent: "flex-end",
        flexDirection: "column",
        display: "flex",
        flex: 1,
      }}
    >
      <Grid
        justifyContent="space-evenly"
        rowSpacing={4}
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          textAlign: {
            xs: "center",
            sm: "unset",
          },
        }}
        container
      >
        {footerData.map((footer) => (
          <Grid key={footer.title} xs={12} sm="auto" item>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {footer.title}
            </Typography>
            <Container
              component="ul"
              sx={{ listStyleType: "none", paddingLeft: { sm: 0 } }}
            >
              {footer.links.map((item) => (
                <Container
                  key={item.title}
                  component="li"
                  sx={{ mt: { xs: 1 } }}
                >
                  <Link href={item.url}>{item.title}</Link>
                </Container>
              ))}
            </Container>
          </Grid>
        ))}
      </Grid>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
};
