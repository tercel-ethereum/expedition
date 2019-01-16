import * as React from 'react';
import HashRate from '../components/HashRate';
import HashChart from '../components/HashChart';
import BlockList from './BlockList';
import { EthRpc } from 'emerald-js-ui';
import Typography from '@material-ui/core/Typography';
import { hashesToGH } from '../components/formatters';
import { VictoryChart, VictoryBar, VictoryLabel } from 'victory';
import { weiToGwei } from '../components/formatters';
import Grid from '@material-ui/core/Grid';




const config = {
  blockTime: 15, // seconds
  blockHistoryLength: 1200,
  chartHeight: 200,
  chartWidth: 400
}

const blockMapGasUsed = (block) => {
  return {
    x: block.number,
    y: block.gasUsed / 1000000
  }
}

const blockMapUncles = (block) => {
  return {
    x: block.number,
    y: block.uncles.length
  }
}

const blockMapHashRate = (block) => {
  return {
    x: block.number,
    y: hashesToGH(block.difficulty.dividedBy(config.blockTime))
  }
}

const blockMapTransactionCount = (block) => {
  return {
    x: block.number,
    y: block.transactions.length
  }
}

const getStyles = () => {
  return {
    topItems: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }
}

export default (props: any) => {
  const styles = getStyles();
  return (
    <EthRpc method="eth.getBlock" params={['latest', true]}>
      {block => (
        <EthRpc method="eth.gasPrice">
        {gasPrice => (
          <div>
            <Grid container spacing={24}>
              <Grid style={styles.topItems} item xs={12}>
                <div>
                  <Typography variant="headline">
                    Block Height
                  </Typography>
                  <Typography>{block.number}</Typography>
                </div>
                <div>
                  <Typography variant="headline">
                    Gas Price
                  </Typography>
                  <Typography>{weiToGwei(gasPrice.toNumber())} Gwei</Typography>
                </div>
                <div>
                  <Typography variant="headline">
                    Network Hash Rate
                  </Typography>
                  <HashRate block={block} blockTime={config.blockTime}>
                    {hashRate => <Typography>{hashRate} GH/s</Typography>}
                  </HashRate>
                </div>
                <div>
                  <Typography variant="headline">
                    Peers
                  </Typography>
                  <EthRpc method="net.peerCount">
                    {peerCount => <Typography>{peerCount}</Typography>}
                  </EthRpc>
                </div>
              </Grid>

              <EthRpc method="ext.getBlocks" params={[Math.max(block.number - config.blockHistoryLength + 1, 0), block.number]}>
                {blocks => {
                   if (gasPrice.toNumber() === 0) {
                     return null;
                   }
                   return [
                     <Grid item xs={12} sm={6} lg={3}>
                       <HashChart height={config.chartHeight} title={`Hash Rate Last ${blocks.length} blocks`} data={blocks.map(blockMapHashRate)} />,
                     </Grid>,
                     <Grid item xs={12} sm={6} lg={3}>
                       <VictoryChart height={config.chartHeight} width={config.chartWidth}>
                         <VictoryLabel x={25} y={24} text={`Transaction count last ${blocks.length} blocks`}/>
                         <VictoryBar data={blocks.map(blockMapTransactionCount)} />
                       </VictoryChart>
                     </Grid>,
                     <Grid item xs={12} sm={6} lg={3}>
                       <VictoryChart height={config.chartHeight} width={config.chartWidth}>
                         <VictoryLabel x={25} y={24} text={`Gas Used Last ${blocks.length} blocks`}/>
                         <VictoryBar data={blocks.map(blockMapGasUsed)} />
                       </VictoryChart>
                     </Grid>,
                     <Grid item xs={12} sm={6} lg={3}>
                       <VictoryChart height={config.chartHeight} width={config.chartWidth}>
                         <VictoryLabel x={25} y={24} text={`Uncles Last ${blocks.length} blocks`}/>
                         <VictoryBar data={blocks.map(blockMapUncles)} />
                       </VictoryChart>
                     </Grid>,
                   ]
                }}
              </EthRpc>
              <Grid item>
                <Typography variant="headline">
                  Last 10 blocks (View All)
                </Typography>
                <BlockList from={Math.max(block.number - 11, 0)} to={block.number} />
              </Grid>
            </Grid>
          </div>
        )}
        </EthRpc>
      )}
    </EthRpc>
  )
}
