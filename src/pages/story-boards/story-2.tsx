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

  const [eventX, updateEventX] = useReducer(
    (prev, next) => {
      const newEvent = { ...prev, ...next };

      if (
        newEvent.region1 &&
        newEvent.region2 &&
        (newEvent.region1 !== prev.region1 || newEvent.region2 !== prev.region2)
      ) {
        filterData(newEvent.region1, newEvent.region2);
        createTimeSeries("#chartId");
      }

      if (newEvent.animationCounterUpdate)
        animateTimeSeries(newEvent.animationCounterUpdate);

      return newEvent;
    },
    {
      regions: [],
      region1: "",
      region2: "",
      animationCounterUpdate: undefined,
    },
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      updateEventX({ regions: getRegions() });
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
                          onChange={(e) =>
                            updateEventX({ region1: e.target.value })
                          }
                          input={<OutlinedInput label="Select region 1" />}
                          value={eventX.region1}
                        >
                          {eventX.regions.map((d) => (
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
                          onChange={(e) =>
                            updateEventX({ region2: e.target.value })
                          }
                          input={<OutlinedInput label="Select region 2" />}
                          value={eventX.region2}
                        >
                          {eventX.regions.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!eventX.region1 || !eventX.region2}
                          onClick={() =>
                            updateEventX({ animationCounterUpdate: 0 })
                          }
                          component="span"
                        >
                          Beginning
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!eventX.region1 || !eventX.region2}
                          onClick={() =>
                            updateEventX({ animationCounterUpdate: -1 })
                          }
                          startIcon={<ArrowBackIosIcon />}
                          component="span"
                        >
                          Back
                        </Button>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!eventX.region1 || !eventX.region2}
                          onClick={() =>
                            updateEventX({ animationCounterUpdate: 1 })
                          }
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
