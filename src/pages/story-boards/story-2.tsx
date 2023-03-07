import { useEffect, useReducer, useState } from "react";
import Head from "next/head";
import Box from "@mui/material/Box";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Fade,
  FormControl,
  FormGroup,
  InputLabel,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { blue } from "@mui/material/colors";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import DashboardLayout from "src/components/dashboard-layout/DashboardLayout";
import {
  loadData,
  getRegions,
  filterData,
  animateTimeSeries,
  createTimeSeries,
} from "src/components/story-boards/utils-story-2";

const Story2 = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [region1, setRegion1] = useState<string>("");
  const [region2, setRegion2] = useState<string>("");

  const handleRegion1Select = (e) => {
    const newRegion1 = e.target.value;
    // prettier-ignore
    console.log(`Story2: handleRegion1Select: region1: ${region1}, newRegion1: ${newRegion1}`);
    setRegion1(newRegion1);
    if (newRegion1 && region2) {
      filterData(newRegion1, region2);
      createTimeSeries("#chartId");
    }
  };

  const handleRegion2Select = (e) => {
    const newRegion2 = e.target.value;
    // prettier-ignore
    console.log(`Story2: handleRegion2Select: region2: ${region2}, newRegion2: ${newRegion2}`);
    setRegion2(newRegion2);
    if (newRegion2 && region1) {
      filterData(region1, newRegion2);
      createTimeSeries("#chartId");
    }
  };

  const handleBeginningClick = () => {
    // prettier-ignore
    console.log(`Story2: handleBeginningClick:`);
    animateTimeSeries(0);
  };

  const handleBackClick = () => {
    // prettier-ignore
    console.log(`Story2: handleBackClick:`);
    animateTimeSeries(-1);
  };

  const handlePlayClick = () => {
    // prettier-ignore
    console.log(`Story2: handlePlayClick: `);
    animateTimeSeries(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      setRegions(getRegions());
      setLoading(false);
    };

    try {
      fetchData();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Story-2</title>
      </Head>
      <DashboardLayout>
        <Box
          sx={{
            backgroundColor: "background.default",
            minHeight: "100%",
            py: 8,
          }}
        >
          <Container>
            <Card sx={{ minWidth: 1300 }}>
              <CardHeader
                avatar={
                  <Avatar style={{ backgroundColor: blue[500] }}>
                    <AutoStoriesIcon />
                  </Avatar>
                }
                title="Story-2"
                subheader="Choose two regions and click play to animate the story"
              />
              <CardContent sx={{ pt: "8px" }}>
                {loading ? (
                  <Box sx={{ height: 40 }}>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "800ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <LinearProgress />
                    </Fade>
                  </Box>
                ) : (
                  <>
                    <FormGroup
                      sx={{
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                          alignItems: "center",
                        },
                      }}
                    >
                      <FormControl sx={{ m: 1, width: 20, mt: 0 }} size="small">
                        <Chip
                          label=""
                          style={{
                            backgroundColor: "orange",
                            borderRadius: 0,
                          }}
                        />
                      </FormControl>
                      <FormControl
                        sx={{ m: 1, width: 300, mt: 0 }}
                        size="small"
                      >
                        <InputLabel id="select-region-1-label">
                          Select region 1
                        </InputLabel>
                        <Select
                          labelId="select-region-1-label"
                          id="select-region-1-label"
                          onChange={handleRegion1Select}
                          input={<OutlinedInput label="Select region 1" />}
                          value={region1}
                        >
                          {regions.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <span style={{ width: 30 }}></span>
                      <FormControl sx={{ m: 1, width: 20, mt: 0 }} size="small">
                        <Chip
                          label=""
                          style={{
                            backgroundColor: "steelblue",
                            borderRadius: 0,
                          }}
                        />
                      </FormControl>
                      <FormControl
                        sx={{ m: 1, width: 300, mt: 0 }}
                        size="small"
                      >
                        <InputLabel id="select-region-2-label">
                          Select region 2
                        </InputLabel>
                        <Select
                          labelId="select-region-2-label"
                          id="select-region-2-label"
                          displayEmpty
                          onChange={handleRegion2Select}
                          input={<OutlinedInput label="Select region 2" />}
                          value={region2}
                        >
                          {regions.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!region1 || !region2}
                          onClick={handleBeginningClick}
                          component="span"
                        >
                          Beginning
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!region1 || !region2}
                          onClick={handleBackClick}
                          startIcon={<ArrowBackIosIcon />}
                          component="span"
                        >
                          Back
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!region1 || !region2}
                          onClick={handlePlayClick}
                          endIcon={<ArrowForwardIosIcon />}
                          component="span"
                        >
                          Play
                        </Button>
                      </FormControl>
                    </FormGroup>
                    <div id="chartId" />
                  </>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default Story2;
