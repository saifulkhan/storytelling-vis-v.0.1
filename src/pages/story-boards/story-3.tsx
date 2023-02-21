import { useEffect, useReducer, useState } from "react";
import Head from "next/head";
import Box from "@mui/material/Box";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  getNations,
  filterData,
  createScrollingSvg,
  animateTimeSeries,
} from "src/components/story-boards/utils-story-3";

const Story3 = () => {
  const [loading, setLoading] = useState(true);

  const [eventX, updateEventX] = useReducer(
    (prev, next) => {
      const newEvent = { ...prev, ...next };

      console.log(newEvent);

      if (newEvent.nation && newEvent.nation !== prev.nation) {
        filterData(newEvent.nation).then(() => {
          createScrollingSvg("#chartId");
        });
      } else if (newEvent.animationCounterUpdate) {
        animateTimeSeries(newEvent.animationCounterUpdate);
      }

      return newEvent;
    },
    {
      nations: [],
      nation: "",
      animationCounterUpdate: undefined,
    },
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();

      updateEventX({ nations: getNations() });
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
        <title>Story-3</title>
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
                title="Story-3"
                subheader="Choose a nation and scroll the timeline to animate the story"
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
                      <FormControl
                        sx={{ m: 1, width: 300, mt: 0 }}
                        size="small"
                      >
                        <InputLabel id="select-nation-label">
                          Select nation
                        </InputLabel>
                        <Select
                          labelId="select-nation-label"
                          id="select-nation-label"
                          onChange={(e) =>
                            updateEventX({ nation: e.target.value })
                          }
                          input={<OutlinedInput label="Select nation" />}
                          value={eventX.nation}
                        >
                          {eventX.nations.map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 100, mt: 0 }}>
                        <Button
                          variant="contained"
                          disabled={!eventX.nation}
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
                          disabled={!eventX.nation}
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
                          disabled={!eventX.nation}
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

export default Story3;
